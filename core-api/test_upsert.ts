
import { TemplateService } from './src/services/domain/template.service';
import prisma from './src/lib/prisma';

async function test() {
    const service = new TemplateService();
    const orgId = '59951854-85e4-4375-9bd4-7a712abf0168';
    const userId = 'system-test';
    const data = {
        templateKey: "minimal-glass",
        primaryColor: "#F59E0B",
        secondaryColor: "#FBBF24",
        backgroundColor: "#0C0802",
        surfaceColor: "#100B03",
        navBackground: "#0C0802",
        navTextColor: "#F59E0B",
        borderColor: "#F59E0B44",
        buttonTextColor: "#000000",
        textColor: "#FFFFFF",
        heroTextColor: "#FFFFFF",
        cardBackground: "#1A1208",
        fontFamily: "Outfit",
        fontSizeBasePx: 16,
        fontWeight: "400",
        letterSpacingPx: 0.5,
        borderRadiusPx: 12,
        logoUrl: "https://example.com/logo.png",
        logoHeightPx: 32,
        darkModeDefault: true,
        customCss: ""
    };

    try {
        console.log('Starting test upsert...');
        const result = await service.updateIdentity(orgId, userId, data);
        console.log('Result:', result);
    } catch (err: any) {
        console.error('Test Failed:', err.message);
        if (err.clientVersion) {
            console.error('Prisma Error:', JSON.stringify(err, null, 2));
        }
    } finally {
        await prisma.$disconnect();
    }
}

test();
