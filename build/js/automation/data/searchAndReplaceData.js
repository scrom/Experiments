const fs = require('fs');
const path = require('path');
//const glob = require('glob');

/* 
Script to reach for a collection of individual words and replace them with alternatives. Matches case, and renames files.
Note: this matches *WHOLE WORDS ONLY* (deliberately). so if (e.g. image filenames), or other references to a word are joined words, abbrevbiations etc
there will still be manual cleanup needed - so this is an example file only - the actual data I used and replaced has been removed.
*/

// Directory to search (modify as needed)
const targetDir = path.resolve(__dirname, '../../../../data'); //run additional times for /test/jest (against.js filetypes), /test/testdata (against .json filetypes)

// Words to search for (case-insensitive)
const searchWords = [
  "put your list of", "words to replace", "in this array"
];

// Map of replacements: { searchWord: replacementWord }
const replacementMap = {
   "put your list of" : "and fill in", 
   "words to replace" : "this side of each erplacement word", 
   "in this array": "with the words to want to replace with"
};


// Utility to escape special regex characters in words
function escapeRegex(word) {
  return word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Utility to match the case of the original word
function matchCase(original, replacement) {
  if (original.toUpperCase() === original) {
    return replacement.toUpperCase();
  } else if (original.toLowerCase() === original) {
    return replacement.toLowerCase();
  } else if (original[0].toUpperCase() === original[0]) {
    return replacement[0].toUpperCase() + replacement.slice(1).toLowerCase();
  } else {
    return replacement;
  }
}

// Replace words in a string with case matched replacements, whole words only
function replaceWordsInText(text, words, replacements) {
  const matchedWords = new Set();
  for (const word of words) {
    const escaped = escapeRegex(word);
    const regex = new RegExp(`\\b(${escaped})\\b`, 'gi');
    text = text.replace(regex, (match) => {
      matchedWords.add(word);
      return matchCase(match, replacements[word]);
    });
  }
  return { text, matchedWords };
}

// Glob pattern for all JSON files
const pattern = path.join(targetDir, '**/*.json');  ///*****  Note - this many need changing to use .js in some cases (usually tests that name data) */

fs.glob(pattern, { nodir: true }, (err, files) => {
  if (err) {
    console.error('Error reading files:', err);
    return;
  }

  files.forEach(file => {
    try {
      let content = fs.readFileSync(file, 'utf8');

      // Try parse JSON for pretty formatting
      try {
        const parsed = JSON.parse(content);
        content = JSON.stringify(parsed, null, 2);
      } catch {
        // keep raw content if not valid JSON
      }

      // Replace words in file content
      const { text: replacedContent, matchedWords: contentMatches } = replaceWordsInText(content, searchWords, replacementMap);

      if (contentMatches.size > 0) {
        fs.writeFileSync(file, replacedContent, 'utf8');
        console.info(`📝 Updated content in ${file}`);
        console.info(`   → Replaced in content: ${Array.from(contentMatches).join(', ')}`);
      }

      // Replace words in filename
      const dirname = path.dirname(file);
      const basename = path.basename(file);

      const { text: newBasename, matchedWords: filenameMatches } = replaceWordsInText(basename, searchWords, replacementMap);

      if (filenameMatches.size > 0 && newBasename !== basename) {
        const newPath = path.join(dirname, newBasename);

        // Rename the file
        fs.renameSync(file, newPath);
        console.info(`📂 Renamed file:\n   From: ${basename}\n   To:   ${newBasename}`);
      }

    } catch (err) {
      console.error(`Error processing file ${file}:`, err.message);
    }
  });
});