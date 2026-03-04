import {
    Client,
    Interaction,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ButtonInteraction,
} from 'discord.js';
import { BaseModule } from '../BaseModule';
import { log } from '../../utils/logger';
import coreApi from '../../utils/api-client';

/**
 * StoreModule
 * Gerencia a exibição e navegação de produtos da loja no Discord.
 */

async function browseStore(interaction: ButtonInteraction) {
    if (!interaction.guildId) return;

    await interaction.deferReply({ ephemeral: true });

    try {
        const { data } = await coreApi.get(`/internal/store/products/${interaction.guildId}`);
        const { products, organization } = data;

        if (!products || products.length === 0) {
            return interaction.editReply({
                content: '🛒 **A loja está vazia!**\nNenhum produto ativo foi encontrado para esta comunidade.'
            });
        }

        const embed = new EmbedBuilder()
            .setTitle(`🛒  Loja Oficial: ${organization}`)
            .setDescription('Explore nosso catálogo e adquira vantagens exclusivas para sua experiência!')
            .setColor(0x57F287) // Success Green
            .setThumbnail(interaction.guild?.iconURL() || null)
            .setFooter({ text: 'OrbitOS Monetization Engine • Preços em BRL', iconURL: interaction.client.user?.displayAvatarURL() })
            .setTimestamp();

        // Agrupar produtos de 5 em 5 para os botões (limite do Discord é 5 por linha, max 5 linhas)
        const rows: ActionRowBuilder<ButtonBuilder>[] = [];
        let currentRow = new ActionRowBuilder<ButtonBuilder>();

        products.slice(0, 15).forEach((product: any, index: number) => {
            const price = (product.priceCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: product.currency || 'BRL' });

            embed.addFields({
                name: `${index + 1}. ${product.name}`,
                value: `> ${product.description || 'Sem descrição.'}\n💰 **${price}**`,
                inline: true
            });

            const buyBtn = new ButtonBuilder()
                .setCustomId(`store_buy_${product.id}`)
                .setLabel(`Comprar #${index + 1}`)
                .setStyle(ButtonStyle.Success)
                .setEmoji('🛒');

            if (currentRow.components.length === 5) {
                rows.push(currentRow);
                currentRow = new ActionRowBuilder<ButtonBuilder>();
            }
            currentRow.addComponents(buyBtn);
        });

        if (currentRow.components.length > 0) rows.push(currentRow);

        await interaction.editReply({
            embeds: [embed],
            components: rows.slice(0, 5)
        });

    } catch (error: any) {
        log.error(`[StoreModule] Erro ao listar produtos: ${error.message}`);
        await interaction.editReply({
            content: '❌ **Erro de Conexão**\nNão foi possível carregar o catálogo da loja agora. Tente novamente em alguns instantes.'
        });
    }
}

const StoreModule: BaseModule = {
    id: 'store_panel',
    name: 'Loja OrbitUp',
    category: 'Monetization',

    async init(client: Client) {
        log.info('[StoreModule] Módulo de loja inicializado.');
    },

    async handleInteraction(interaction: Interaction) {
        if (!interaction.isButton()) return;

        if (interaction.customId === 'store_browse') {
            await browseStore(interaction as ButtonInteraction);
            return;
        }

        if (interaction.customId.startsWith('store_buy_')) {
            const productId = interaction.customId.replace('store_buy_', '');

            const embed = new EmbedBuilder()
                .setTitle('🛍️  Quase lá!')
                .setDescription(
                    `Você selecionou um item da nossa loja.\n\n` +
                    `Para garantir a entrega automática e segura, as compras são processadas em nosso portal oficial.`
                )
                .addFields({
                    name: '🔗 Link de Checkout',
                    value: `[Clique aqui para finalizar seu pedido](https://orbitup.io/store/${interaction.guildId}/buy/${productId})`
                })
                .setColor(0x5865F2)
                .setFooter({ text: 'Segurança garantida por OrbitUp.io' });

            await interaction.reply({
                embeds: [embed],
                ephemeral: true
            });
        }
    }
};

export default StoreModule;
