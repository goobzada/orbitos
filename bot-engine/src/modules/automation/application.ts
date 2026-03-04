import {
    Client,
    Interaction,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ButtonInteraction,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
} from 'discord.js';
import { BaseModule } from '../BaseModule';
import { log } from '../../utils/logger';
import coreApi from '../../utils/api-client';

/**
 * ApplicationModule
 * Gerencia formulários de recrutamento e inscrições.
 */

interface AppSession {
    formId: string;
    formName: string;
    questions: any[];
    currentIndex: number;
    answers: { questionId: string, value: string }[];
}

const sessions = new Map<string, AppSession>();

async function startApplicationFlow(interaction: ButtonInteraction | StringSelectMenuInteraction) {
    const userId = interaction.user.id;
    await interaction.deferReply({ ephemeral: true });

    try {
        const { data: forms } = await coreApi.get(`/internal/applications/${interaction.guildId}`);

        if (!forms || forms.length === 0) {
            return interaction.editReply({ content: '📝 **Nenhum formulário ativo!**\nNão há processos de recrutamento abertos no momento.' });
        }

        // Se houver mais de um formulário, pede para selecionar
        if (forms.length > 1 && interaction.isButton()) {
            const select = new StringSelectMenuBuilder()
                .setCustomId('app_select_form')
                .setPlaceholder('Selecione o formulário que deseja preencher')
                .addOptions(forms.map((f: any) => ({
                    label: f.name,
                    value: f.id,
                    description: f.description || 'Formulário de inscrição'
                })));

            const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);
            return interaction.editReply({ content: '📂 **Escolha uma categoria:**', components: [row] });
        }

        // Se for apenas um ou se já selecionou no menu
        const form = forms.length === 1 ? forms[0] : forms.find((f: any) => f.id === (interaction as StringSelectMenuInteraction).values?.[0]);

        if (!form) return interaction.editReply({ content: '❌ Formulário não encontrado.' });

        sessions.set(userId, {
            formId: form.id,
            formName: form.name,
            questions: form.questions,
            currentIndex: 0,
            answers: []
        });

        await sendNextQuestion(interaction, userId);

    } catch (error: any) {
        log.error(`[Application] Erro: ${error.message}`);
        await interaction.editReply({ content: '❌ Erro ao carregar formulários.' });
    }
}

async function sendNextQuestion(interaction: any, userId: string) {
    const session = sessions.get(userId);
    if (!session) return;

    const question = session.questions[session.currentIndex];
    const total = session.questions.length;
    const progress = Math.round(((session.currentIndex) / total) * 100);

    const embed = new EmbedBuilder()
        .setTitle(`📝  ${session.formName}  (${session.currentIndex + 1}/${total})`)
        .setDescription(`### ${question.label}\n${question.placeholder || ''}\n\n\`${'█'.repeat(progress / 10)}${'░'.repeat(10 - (progress / 10))}\` **${progress}%**`)
        .setColor(0x5865F2)
        .setFooter({ text: 'OrbitOS Application System • Responda com calma' });

    // Para formulário, usamos Botões para respostas curtas ou Sim/Não se possível, 
    // mas para flexibilidade, usaremos apenas Botões de "Responder" que abrem MODAL?
    // Não, modals perdem o contexto. Vamos usar botões de opção se a questão for do tipo SELECT,
    // ou apenas pedir para digitar no chat? Melhor usar modal para CADA pergunta se quisermos algo limpo, 
    // ou um fluxo de mensagens. 
    // Como o Discord limita 5 campos por modal, se a pergunta for uma só, o modal funciona bem.

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId(`app_answer_btn_${question.id}`)
            .setLabel('Responder Pergunta')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('✍️')
    );

    await interaction.editReply({ embeds: [embed], components: [row] });
}

// Handler para quando o usuário clica em "Responder Pergunta"
async function openAnswerModal(interaction: ButtonInteraction) {
    const userId = interaction.user.id;
    const session = sessions.get(userId);
    if (!session) return;

    const question = session.questions[session.currentIndex];

    const modal = new ModalBuilder()
        .setCustomId(`app_modal_${question.id}`)
        .setTitle(session.formName.substring(0, 45));

    const input = new TextInputBuilder()
        .setCustomId('answer_value')
        .setLabel(question.label.substring(0, 45))
        .setPlaceholder(question.placeholder || 'Sua resposta...')
        .setRequired(question.required)
        .setStyle(question.type === 'PARAGRAPH' ? TextInputStyle.Paragraph : TextInputStyle.Short);

    modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(input));

    await interaction.showModal(modal);
}

const ApplicationModule: BaseModule = {
    id: 'application',
    name: 'Formulários / Recrutamento',
    category: 'Engagement',

    async init(client: Client) {
        log.info('[ApplicationModule] Módulo de formulários inicializado.');
    },

    async handleInteraction(interaction: Interaction) {
        const userId = interaction.user.id;

        if (interaction.isButton()) {
            if (interaction.customId === 'application_start') {
                await startApplicationFlow(interaction as ButtonInteraction);
                return;
            }

            if (interaction.customId.startsWith('app_answer_btn_')) {
                await openAnswerModal(interaction as ButtonInteraction);
                return;
            }
        }

        if (interaction.isStringSelectMenu() && interaction.customId === 'app_select_form') {
            await startApplicationFlow(interaction as StringSelectMenuInteraction);
            return;
        }

        if (interaction.isModalSubmit() && interaction.customId.startsWith('app_modal_')) {
            const session = sessions.get(userId);
            if (!session) return;

            const answerValue = interaction.fields.getTextInputValue('answer_value');
            const questionId = interaction.customId.replace('app_modal_', '');

            session.answers.push({ questionId, value: answerValue });
            session.currentIndex++;

            await interaction.deferUpdate();

            if (session.currentIndex >= session.questions.length) {
                // Finalizar!
                try {
                    await coreApi.post('/internal/applications/submit', {
                        formId: session.formId,
                        userId: userId,
                        discordGuildId: interaction.guildId,
                        answers: session.answers
                    });

                    const successEmbed = new EmbedBuilder()
                        .setTitle('✅ Envido com Sucesso!')
                        .setDescription('Sua inscrição foi recebida e será analisada pela equipe.\nFique atento às suas mensagens diretas!')
                        .setColor(0x57F287);

                    await interaction.editReply({ embeds: [successEmbed], components: [] });
                } catch (e) {
                    await interaction.editReply({ content: '❌ Erro ao salvar sua inscrição. Tente novamente.', embeds: [], components: [] });
                }
                sessions.delete(userId);
            } else {
                await sendNextQuestion(interaction, userId);
            }
        }
    }
};

export default ApplicationModule;
