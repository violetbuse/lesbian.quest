import { defineWorkersConfig, readD1Migrations } from '@cloudflare/vitest-pool-workers/config';
import path from 'node:path';

export default defineWorkersConfig(async () => {

	const migrationsPath = path.join(__dirname, 'migrations');
	const migrations = await readD1Migrations(migrationsPath);

	return {
		test: {
			deps: {
				optimizer: {
					ssr: {
						enabled: true,
						include: ['@clerk/backend', 'snakecase-keys', 'snake-case', 'hono'],
					}
				}
			},
			poolOptions: {
				workers: {
					isolatedStorage: true,
					singleWorker: false,
					wrangler: { configPath: './wrangler.jsonc' },
					miniflare: {
						bindings: {
							TEST_MIGRATIONS: migrations,
							ENVIRONMENT: 'test',
						}
					},
				},
			},
			alias: {
				'@': path.resolve(__dirname, './src'),
			}
		}
	}
});
