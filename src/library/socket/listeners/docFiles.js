import { ChangeTypes } from '../../redux/reducers/root';
import store from '../../redux/store';
import { createDocFiles, updateDocFiles } from '../../redux/actions/docFiles';

const events = {
  DOCFILE: 'docFile',
};

export const docFile = () => ({
  event: events.DOCFILE,
  callback: ({ error, data }) => {
    if (data && data.docFile) {
      const { docFile: sentDocFile, changeType } = data;

      if (changeType === ChangeTypes.CREATE) {
        store.dispatch(createDocFiles({ docFiles: [sentDocFile] }));
      } else if (changeType === ChangeTypes.UPDATE) {
        store.dispatch(updateDocFiles({ docFiles: [sentDocFile] }));
      }

      return;
    }

    console.log(events.DOCFILE, error, data);
  },
});
