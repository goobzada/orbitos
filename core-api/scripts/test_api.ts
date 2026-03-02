
import axios from 'axios';

async function test() {
    try {
        const login = await axios.post('http://localhost:4000/auth/login', {
            discordId: "1234567890",
            username: "admin_tester"
        });
        const token = login.data.token;

        const servers = await axios.get('http://localhost:4000/servers', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('API SERVERS:', JSON.stringify(servers.data, null, 2));
    } catch (e: any) {
        console.error('ERROR:', e.response?.data || e.message);
    }
}

test();
