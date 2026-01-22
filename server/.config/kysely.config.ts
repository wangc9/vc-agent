import { defineConfig } from 'kysely-ctl';
import {dialect} from '../src/database/index';

export default defineConfig({
	dialect,
	migrations: {
		migrationFolder: "../src/database/migrations",
	},
	plugins: [],
	seeds: {
		seedFolder: "../src/database/seeds",
	}
})
