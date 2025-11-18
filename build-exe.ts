/**
 * Build script for creating Windows executable
 * This script compiles the entire application into a single .exe file
 */

import { $ } from "bun";
import { existsSync, mkdirSync } from "fs";

console.log('🏗️  Building Dashboard Analytics for Windows...\n');

// Create dist directory if it doesn't exist
if (!existsSync('./dist')) {
  mkdirSync('./dist', { recursive: true });
}

// Step 1: Build the application
console.log('📦 Step 1: Building application...');
try {
  await $`bun run build`;
  console.log('✅ Build completed\n');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}

// Step 2: Compile to executable
console.log('📦 Step 2: Compiling to Windows executable...');
console.log('⏳ This may take a few minutes...\n');

try {
  // Compile server to standalone executable
  await $`bun build ./src/index.tsx --compile --minify --sourcemap --outfile ./dist/dashboard.exe`;
  
  console.log('✅ Compilation completed!\n');
  console.log('🎉 Build successful!');
  console.log('\n📁 Output files:');
  console.log('   - dist/dashboard.exe (Windows executable)');
  console.log('\n📝 Important notes:');
  console.log('   1. Create .env file in the same directory as dashboard.exe');
  console.log('   2. Add: DATABASE_URL=your_database_url');
  console.log('   3. Run: dashboard.exe');
  console.log('\n🚀 To run the executable:');
  console.log('   cd dist');
  console.log('   dashboard.exe');
  
} catch (error) {
  console.error('❌ Compilation failed:', error);
  console.log('\n💡 Troubleshooting:');
  console.log('   - Make sure you have the latest version of Bun installed');
  console.log('   - Try: bun upgrade');
  process.exit(1);
}

