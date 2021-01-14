import React from 'react';

import Select from './Select/Select';

export const Pronouns = {
  they: 'They/Them',
  she: 'She/Her',
  he: 'He/Him',
  it: 'It',
};

const PronounsSelect = ({ preselected }) => (
  <Select
    multiple
    required
    defaultValue={preselected}
    name="pronouns"
  >
    <option value="">---Choose pronouns---</option>
    <option value="they">They/Them</option>
    <option value="she">She/Her</option>
    <option value="he">He/Him</option>
    <option value="it">It</option>
  </Select>
);

export default PronounsSelect;
