import { TemplateService } from './src/services/domain/template.service';
async function run() {
    const ts = new TemplateService();
    const identity = await ts.getIdentity('aaad9caa-c142-430c-9f95-6ffd18713e30');
    console.log(JSON.stringify(identity, null, 2));
}
run();
