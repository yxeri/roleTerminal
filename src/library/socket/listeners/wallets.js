import { ChangeTypes } from '../../redux/reducers/root';
import store from '../../redux/store';
import { createWallets, updateWallets } from '../../redux/actions/wallets';

const events = {
  WALLET: 'wallet',
};

export const wallet = () => ({
  event: events.WALLET,
  callback: ({ error, data }) => {
    if (data && data.wallet) {
      const { wallet: sentWallet, changeType } = data;

      if (changeType === ChangeTypes.CREATE) {
        store.dispatch(createWallets({ wallets: [sentWallet] }));
      } else if (changeType === ChangeTypes.UPDATE) {
        store.dispatch(updateWallets({ wallets: [sentWallet] }));
      }

      return;
    }

    console.log(events.WALLET, error, data);
  },
});
