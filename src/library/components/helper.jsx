import { createPortal } from 'react-dom';

export const createDialog = (dialog) => createPortal(dialog, document.querySelector('#MainWindow'));
