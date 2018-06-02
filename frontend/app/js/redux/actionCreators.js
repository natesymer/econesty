import API from 'base/api';
import * as ActionTypes from './actionTypes';

const _walletsStartLoad = (stopLoading) => ({ type: ActionTypes.WALLETS_START_LOAD, stopLoading });
const _walletsAbortLoad = () => ({ type: ActionTypes.WALLETS_ABORT_LOAD });
const _loadWalletsComplete = (fetched, error, wallets) => ({ type: ActionTypes.LOAD_WALLETS_COMPLETE, fetched, error, wallets });
const _createWalletComplete = (wallet, error) => ({ type: ActionTypes.CREATE_WALLET_COMPLETE, wallet, error });
const _deleteWalletComplete = (wallet, error) => ({ type: ActionTypes.DELETE_WALLET_COMPLETE, wallet, error });

export function reloadWallets(refetchInterval = 3600000) {
   return (dispatch, getState) => {
     let fetched = getState().wallets.fetched;
     if (fetched + refetchInterval < new Date().getTime()) {
       let p = API.wallet.withParams({ user__id: API.getUserID() }).listAll();
       dispatch(_walletsStartLoad(p.abort));
       p.catch(err => dispatch(err.name === "AbortError" ? _walletsAbortLoad() : _loadWalletsComplete(new Date().getTime(), err, []))
       ).then( res  => dispatch(_loadWalletsComplete(new Date().getTime(), null, res)));
     }
   };
}

export function createWallet(data = null) {
  return (dispatch, getState) => {
    let p = API.wallet.withParams({ user__id: API.getUserID() });
    if (!data) p = p.classMethod("POST", "generate", {});
    else p = p.create(data);
    dispatch(_walletsStartLoad(p.abort));
    p.catch(err => dispatch(err.name === "AbortError" ? _walletsAbortLoad() : _createWalletComplete(null, err))).then(res => {
      dispatch(_createWalletComplete(res, null));
    });
  };
};

export function deleteWallet(walletId) {
  return (dispatch, getState) => {
    let p = API.wallet.withParams({ user__id: API.getUserID() }).delete(walletId);
    dispatch(_walletsStartLoad(p.abort));
    p.catch(err => dispatch(err.name === "AbortError" ? _walletsAbortLoad() : _deleteWalletComplete(null, err))).then(res => {
      dispatch(_deleteWalletComplete({ id: walletId }, null));
    });
  };
};

const _loadUserStart = (userId, stopLoading) => ({ type: ActionTypes.LOAD_USER_START, userId, stopLoading });
const _loadUserAbort = (userId) => ({ type: ActionTypes.LOAD_USER_ABORT, userId });
const _loadUserComplete = (userId, fetched, error, user) => ({ type: ActionTypes.LOAD_USER_COMPLETE, userId, fetched, error, user });

export function reloadUser(userId, refetchInterval = 3600000) {
  return (dispatch, getState) => {
    let user = getState().users[userId];
     if (!user || user.error || (user.fetched + refetchInterval < new Date().getTime())) {
       let p = API.user.read(userId);
       dispatch(_loadUserStart(userId, p.abort));
       p.catch(err => {
         if (err.name === "AbortError") {
           dispatch(_loadUserAbort(userId));
         } else {
           dispatch(_loadUserComplete(userId, new Date().getTime(), err, null));
         }
       }).then(res  => {
         dispatch(_loadUserComplete(userId, new Date().getTime(), null, res));
       });
     }
  };
}

const _loadTransactionsStart = (userId, stopLoading) => ({ type: ActionTypes.LOAD_TRANSACTIONS_START, userId, stopLoading });
const _loadTransactionsAbort = (userId) => ({ type: ActionTypes.LOAD_TRANSACTIONS_ABORT, userId });
const _loadTransactionsComplete = (userId, fetched, error, transactions, page, nextPage, previousPage, count) => ({ type: ActionTypes.LOAD_TRANSACTIONS_COMPLETE, userId, fetched, error, transactions, page, nextPage, previousPage, count });

export function reloadTransactions(userId, page, refetchInterval = 3600000) {
  return (dispatch, getState) => {
    let transactions = getState().transactions[userId];
    if (!transactions || page !== transactions.page || (transactions.fetched + refetchInterval < new Date().getTime())) {
      let p = API.user.append("/" + userId + "/transactions").list(page);
      dispatch(_loadTransactionsStart(userId, p.abort));
      p.catch(err => {
         if (err.name === "AbortError") {
           dispatch(_loadTransactionsAbort(userId));
         } else {
           dispatch(_loadTransactionsComplete(userId, new Date().getTime(), err, null, null, null, null, null));
         }
       }).then(res  => {
         dispatch(_loadTransactionsComplete(userId, new Date().getTime(), null, res.results, page, res.next, res.previous, res.count));
       });
    }
  };
}

const _requirementsStartLoad = (stopLoading) => ({ type: ActionTypes.REQUIREMENTS_START_LOAD, stopLoading });
const _requirementsAbortLoad = () => ({ type: ActionTypes.REQUIREMENTS_ABORT_LOAD });
const _loadRequirementsComplete = (fetched, error, requirements, page, nextPage, previousPage, count) => ({ type: ActionTypes.LOAD_REQUIREMENTS_COMPLETE, fetched, error, requirements, page, nextPage, previousPage, count});
const _saveRequirementComplete = (requirement, error) => ({ type: ActionTypes.SAVE_REQUIREMENT_COMPLETE, requirement, error });

export function reloadRequirements(page, refetchInterval = 3600000) {
  return (dispatch, getState) => {
    let rs = getState().requirements;
    if (!rs || rs.page !== page || (rs.fetched + refetchInterval < new Date().getTime())) {
      let p = API.requirement.withParams({ user__id: API.getUserID() }).list(page);
      dispatch(_requirementsStartLoad(p.abort));
      p.catch(err => {
         if (err.name === "AbortError") {
           dispatch(_requirementsAbortLoad());
         } else {
           dispatch(_loadRequirementsComplete(new Date().getTime(), err, null, null, null, null, null));
         }
       }).then(res  => {
         dispatch(_loadRequirementsComplete(new Date().getTime(), null, res.results, page, res.next, res.previous, res.count));
       });
    }
  };
}

export function saveRequirement(r) {
  return (dispatch, getState) => {
    let p = API.requirement.withParams({ user__id: API.getUserID() }).save(r);
    dispatch(_requirementsStartLoad());
    p.catch(err => dispatch(err.name === "AbortError" ? _requirementsAbortLoad() : _saveRequirementComplete(null, err))).then(req => dispatch(_saveRequirementComplete(req, null)));

  };
}
