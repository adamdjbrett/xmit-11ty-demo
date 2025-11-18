import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { gzipSync, brotliCompressSync, constants } from 'node:zlib';
import { join } from 'node:path';

/**
 * Compress a single file with gzip and brotli
 * @param {string} filePath - Full path to file
 */
function compressFile(filePath) {
	const data = readFileSync(filePath);
	
	// Generate gzip compressed version (level 9 = max compression)
	const gzipped = gzipSync(data, { level: 9 });
	writeFileSync(`${filePath}.gz`, gzipped);
	
	// Generate brotli compressed version (quality 11 = max compression)
	const brotlied = brotliCompressSync(data, {
		params: {
			[constants.BROTLI_PARAM_QUALITY]: 11
		}
	});
	writeFileSync(`${filePath}.br`, brotlied);
	
	console.log(`  ✓ ${filePath}`);
}

/**
 * Recursively walk directory and compress matching files
 * @param {string} dir - Directory to walk
 */
function walkAndCompress(dir) {
	const entries = readdirSync(dir);
	
	for (const entry of entries) {
		const fullPath = join(dir, entry);
		const stat = statSync(fullPath);
		
		if (stat.isDirectory()) {
			walkAndCompress(fullPath);
		} else if (/\.(html|css|js|xml|json|svg|txt|md)$/i.test(entry)) {
			// Skip already compressed files
			if (!/\.(gz|br)$/.test(entry)) {
				compressFile(fullPath);
			}
		}
	}
}

// Run compression on _site directory
const siteDir = '_site';
console.log(`\n🗜️  Compressing files in ${siteDir}...\n`);

try {
	walkAndCompress(siteDir);
	console.log('\n✅ Compression complete!\n');
} catch (error) {
	console.error('❌ Compression failed:', error.message);
	process.exit(1);
}
