import React from 'react';
import { useForm } from 'react-hook-form';
import { func, node } from 'prop-types';

const Form = ({ onSubmit, children }) => {
  const { handleSubmit } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {children}
    </form>
  );
}

export default React.memo(Form);

Form.propTypes = {
  onSubmit: func.isRequired,
  children: node.isRequired,
};
