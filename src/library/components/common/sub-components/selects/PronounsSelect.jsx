import React from 'react';
import { arrayOf, string } from 'prop-types';

import Select from './Select/Select';

export const Pronouns = {
  they: 'They/Them',
  she: 'She/Her',
  he: 'He/Him',
  it: 'It',
};

const PronounsSelect = ({ preselected }) => (
  <div>
    <span>Pronouns</span>
    <Select
      multiple
      required
      defaultValue={preselected}
      name="pronouns"
    >
      <option value="they">They/Them</option>
      <option value="she">She/Her</option>
      <option value="he">He/Him</option>
      <option value="it">It</option>
    </Select>
  </div>
);

export default PronounsSelect;

PronounsSelect.propTypes = {
  preselected: arrayOf(string),
};

PronounsSelect.defaultProps = {
  preselected: undefined,
};
