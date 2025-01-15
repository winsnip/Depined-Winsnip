import randomUseragent from 'random-useragent';
import axios from 'axios';
import chalk from 'chalk';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { SocksProxyAgent } from 'socks-proxy-agent';
import fs from 'fs/promises';

const banner = `
╔═══════════════════════════════════════════════╗
║            Depined CLI Version v1.0           ║
╚═══════════════════════════════════════════════╝
`;

const logger = {
    log: (level, message, value = '') => {
        const now = new Date().toLocaleString();
        const colors = {
            info: chalk.cyanBright,
            warn: chalk.yellow,
            error: chalk.red,
            success: chalk.greenBright,
            debug: chalk.magenta,
        };

        const icons = {
            info: '[INFO]',
            warn: '[WARN]',
            error: '[ERROR]',
            success: '[SUCCESS]',
            debug: '[DEBUG]',
        };

        const color = colors[level] || chalk.white;
        const icon = icons[level] || '[INFO]';
        const levelTag = `${icon}`;
        const timestamp = chalk.grey(`[ ${now} ]`);

        // Formatting the log output with dividers and clear structure
        let formattedMessage = `${chalk.green('╔═══════════════════════════════════════════════╗')}`;
        formattedMessage += `\n${chalk.green('║')}${chalk.white('            Depined CLI Version v1.0           ')}${chalk.green('║')}`;
        formattedMessage += `\n${chalk.green('╚═══════════════════════════════════════════════╝')}\n`;

        formattedMessage += `${timestamp} ${levelTag} ${color(message)}`;
        
        if (value) {
            if (typeof value === 'object') {
                formattedMessage += `\n${chalk.green('╔═══════════════════════════════════════════════╗')}`;
                formattedMessage += `\n${chalk.green('║')} ${chalk.white(JSON.stringify(value, null, 2))} ${chalk.green('║')}`;
                formattedMessage += `\n${chalk.green('╚═══════════════════════════════════════════════╝')}`;
            } else {
                formattedMessage += ` ${color(value)}`;
            }
        }

        console.log(formattedMessage);
    },

    info: (message, value = '') => logger.log('info', message, value),
    warn: (message, value = '') => logger.log('warn', message, value),
    error: (message, value = '') => logger.log('error', message, value),
    success: (message, value = '') => logger.log('success', message, value),
    debug: (message, value = '') => logger.log('debug', message, value),
};






function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms * 1000));
}

async function saveToFile(filename, data) {
    try {
        await fs.appendFile(filename, `${data}\n`, 'utf-8');
        logger.info(`Data saved to ${filename}`);
    } catch (error) {
        logger.error(`Failed to save data to ${filename}: ${error.message}`);
    }
}

async function readFile(pathFile) {
    try {
        const datas = await fs.readFile(pathFile, 'utf8');
        return datas.split('\n')
            .map(data => data.trim())
            .filter(data => data.length > 0);
    } catch (error) {
        logger.error(`Error reading file: ${error.message}`);
        return [];
    }
}

const newAgent = (proxy = null) => {
    if (proxy) {
        if (proxy.startsWith('http://')) {
            return new HttpsProxyAgent(proxy);
        } else if (proxy.startsWith('socks4://') || proxy.startsWith('socks5://')) {
            return new SocksProxyAgent(proxy);
        } else {
            logger.warn(`Unsupported proxy type: ${proxy}`);
            return null;
        }
    }
    return null;
};

const headers = {
    "Accept": "application/json",
    "Accept-Language": "en-US,en;q=0.9",
    "User-Agent": randomUseragent.getRandom(),
};

async function registerUser(email, password) {
    const url = 'https://api.depined.org/api/user/register';

    try {
        const response = await axios.post(url, { email, password }, {
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            }
        });
        logger.info('User registered successfully:', response.data.message);
        return response.data;
    } catch (error) {
        logger.error('Error registering user:', error.response ? error.response.data : error.message);
        return null;
    }
}

async function loginUser(email, password) {
    const url = 'https://api.depined.org/api/user/login';

    try {
        const response = await axios.post(url, { email, password }, {
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            }
        });
        logger.info('User Login successfully:', response.data.message);
        return response.data;
    } catch (error) {
        logger.error('Error Login user:', error.response ? error.response.data : error.message);
        return null;
    }
}

async function createUserProfile(token, payload) {
    const url = 'https://api.depined.org/api/user/profile-creation';

    try {
        const response = await axios.post(url, payload, {
            headers: {
                ...headers,
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        logger.info('Profile created successfully:', response.data.message);
        return response.data;
    } catch (error) {
        logger.error('Error creating profile:', error.response ? error.response.data : error.message);
        return null;
    }
}

async function confirmUserReff(token, referral_code) {
    const url = 'https://api.depined.org/api/access-code/referal';

    try {
        const response = await axios.post(url, { referral_code }, {
            headers: {
                ...headers,
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        logger.info('Confirm User referral successfully:', response.data.message);
        return response.data;
    } catch (error) {
        logger.error('Error Confirm User referral:', error.response ? error.response.data : error.message);
        return null;
    }
}

async function getUserInfo(token, proxy) {
    const agent = newAgent(proxy);
    try {
        const response = await axios.get('https://api.depined.org/api/user/details', {
            headers: {
                ...headers,
                'Authorization': 'Bearer ' + token
            },
            httpsAgent: agent,
            httpAgent: agent
        });

        return response.data;
    } catch (error) {
        logger.error('Error fetching user info:', error.message || error);
        return null;
    }
}

async function getEarnings(token, proxy) {
    const agent = newAgent(proxy);
    try {
        const response = await axios.get('https://api.depined.org/api/stats/epoch-earnings', {
            headers: {
                ...headers,
                'Authorization': 'Bearer ' + token
            },
            httpsAgent: agent,
            httpAgent: agent
        });

        return response.data;
    } catch (error) {
        logger.error('Error fetching earnings:', error.message || error);
        return null;
    }
}

async function connect(token, proxy) {
    const agent = newAgent(proxy);
    try {
        const payload = { connected: true };
        const response = await axios.post('https://api.depined.org/api/user/widget-connect', payload, {
            headers: {
                ...headers,
                'Authorization': 'Bearer ' + token
            },
            httpsAgent: agent,
            httpAgent: agent
        });

        return response.data;
    } catch (error) {
        logger.error(`Error when update connection: ${error.message}`);
        return null;
    }
}

const main = async () => {
    logger.info(banner);
    await delay(3);
    const tokens = await readFile("tokens.txt");
    if (tokens.length === 0) {
        logger.error('No tokens found in tokens.txt');
        return;
    }
    const proxies = await readFile("proxy.txt");
    if (proxies.length === 0) {
        logger.warn('Running without proxy...');
    }

    try {
        logger.info(`Starting Program for all accounts:`, tokens.length);

        const accountsProcessing = tokens.map(async (token, index) => {
            const proxy = proxies[index % proxies.length] || null;
            try {
                const userData = await getUserInfo(token, proxy);

                if (userData?.data) {
                    const { email, verified, current_tier, points_balance } = userData.data;
                    logger.info(`Account ${index + 1} info:`, { email, verified, current_tier, points_balance });
                }

                setInterval(async () => {
                    const connectRes = await connect(token, proxy);
                    logger.info(`Ping result for account ${index + 1}:`, connectRes || { message: 'unknown error' });

                    const result = await getEarnings(token, proxy);
                    logger.info(`Earnings result for account ${index + 1}:`, result?.data || { message: 'unknown error' });
                }, 1000 * 30);

            } catch (error) {
                logger.error(`Error processing account ${index}: ${error.message}`);
            }
        });

        await Promise.all(accountsProcessing);
    } catch (error) {
        logger.error(`Error in main loop: ${error.message}`);
    }
};

process.on('SIGINT', () => {
    logger.warn(`Process received SIGINT, cleaning up and exiting program...`);
    process.exit(0);
});

process.on('SIGTERM', () => {
    logger.warn(`Process received SIGTERM, cleaning up and exiting program...`);
    process.exit(0);
});

main();
