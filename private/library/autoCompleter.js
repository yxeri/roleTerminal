/*
 Copyright 2016 Aleksandar Jankovic

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

/**
 * Match partial string against one to many strings and return matches
 * @param {string} partial - Partial string to match
 * @param {string[]} items - All matchable items
 * @returns {string[]} - Matched strings
 */
function match(partial, items) {
  const matched = [];
  let matches = false;

  for (let i = 0; i < items.length; i += 1) {
    const name = items[i];

    for (let j = 0; j < partial.length; j += 1) {
      if (partial.charAt(j) === name.charAt(j)) {
        matches = true;
      } else {
        matches = false;

        break;
      }
    }

    if (matches) {
      matched.push(name);
    }
  }

  return matched;
}

exports.match = match;
