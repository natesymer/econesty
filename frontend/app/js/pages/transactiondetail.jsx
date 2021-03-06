import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { Table } from 'base/components/elements';
import { BTC, SideMargins, XOverflowable, FlexControlBlock, Save } from 'app/common';
import { API, Flex, Anchor, CollectionView, ElementView, Form, Select, Input, Button } from 'base/base';
import style from 'app/style';
import BaseStyles from 'base/style';
import { noSelect } from 'base/style/mixins';

const tdStyles = {
  headerBlock: {
    marginBottom: "2rem"
  },
  title: {
    ...noSelect(),
    margin: BaseStyles.padding
  },
  cardinality: {
    ...noSelect(),
    ...style.text.secondary,
    margin: BaseStyles.padding
  },
  errorMessage: {

  },
  saveButton: {
    margin: `0 ${BaseStyles.padding}`
  },
  table: {

  }
};

function makeWalletsPromise() {
  return API.wallet.withParams({ user__id: API.getUserID() }).listAll();
}

function UserLink({ user }) {
  return (
    <Anchor
      style={style.text.secondary}
      href={"/user/" + user.id}>
      {user.first_name} {user.last_name} (@{user.username})
    </Anchor>
  );
}

function attemptFinalize(transaction, elementView) {
  elementView.setLoading(true, true);
  API.transaction.instanceMethod("POST", "finalize", transaction.id).then(elementView.setElement);
}

function TransactionInfo({ elementView }) {
  let t = elementView.getElement();

  let userId = parseInt(API.getUserID());

  let needsRecipientWallet = t.recipient_wallet === null || t.recipient_wallet === undefined;
  let needsSenderWallet = t.sender_wallet === null || t.sender_wallet === undefined;
  let isSender = t.sender.id === API.getUserID();
  let isRecipient = t.recipient.id === API.getUserID();
  let transactionColor = t.completed
           ? t.success ? "green" : "yellow"
           : t.rejected ? "red" : null;

  let direction = null;
  let user = null;
  if (t.sender.id === userId) {
    direction = "to";
    user = t.recipient;
  } else if (t.recipient.id === userId) {
    direction = "from";
    user = t.sender;
  }

  if (!user || !direction) return null; // TODO: invalid transaction page

  return (
    <div>
      <Flex container column alignItems="center" style={tdStyles.headerBlock}>
        <p style={{ ...style.text.primary, ...tdStyles.title, color: transactionColor }}>Transaction #{t.id}</p>
        <Flex container alignItems="center" justifyContent="center" style={tdStyles.cardinality}>
          <BTC />
          <span>{parseFloat(t.amount)}</span>
          <span>&nbsp;</span>
          <small>{direction}</small>
          <span>&nbsp;</span>
          <UserLink user={user} />
        </Flex>
        {t.completed && !t.success &&
        <Flex container alignItems="center">
          <p style={tdStyles.errorMessage}>{t.error ? "BitCoin Error: " + t.error : "Unknown BitCoin Error"}</p>
          <Button onClick={() => attemptFinalize(t, elementView)}>Retry</Button>
        </Flex>}
      </Flex>
      <Flex container column alignItems="center" style={tdStyles.titleBlock}>
        {needsRecipientWallet && isRecipient && <Form onSubmit={elementView.updateElement}>
            <Input hidden name="id" value={t.id} />
            <FlexControlBlock label="Add your Wallet">
                <Select
                    options={makeWalletsPromise}
                    name="recipient_wallet_id"
                    transform={w => w.id}
                    faceTransform={w => w.private_key} />
                <Button action="submit" style={tdStyles.saveButton}><Save /></Button>
            </FlexControlBlock>
        </Form>}
        {needsSenderWallet && isSender && <Form onSubmit={elementView.updateElement}>
            <Input hidden name="id" value={t.id} />
            <FlexControlBlock label="Add your Wallet">
               <Select
                   options={makeWalletsPromise}
                   name="sender_wallet_id"
                   transform={w => w.id}
                   faceTransform={w => w.private_key} />
               <Button action="submit" style={tdStyles.saveButton}><Save /></Button>
            </FlexControlBlock>
        </Form>}
      </Flex>
    </div>
  );
}

function TransactionDetail({ matches }) {
  return (
    <SideMargins>
      <ElementView collection={API.transaction} elementID={matches.id}>
        <TransactionInfo />
      </ElementView>
      <CollectionView collection={API.requirement.withParams({transaction__id: matches.id})}>
        {collectionView => {
         let rs = collectionView.getElements();

         if (rs.length === 0) return null; // TODO: warning about selecting a wallet and BTC transferring

         return (
           <FlexControlBlock label="Requirements">
             <Flex grow="1" style={style.table.base} column>
               {rs.map((r, idx) =>
               <Flex key={r.id} style={{
                 ...style.table.row,
                 ...(idx % 2 ? style.table.oddRow : {}),
                 minHeight: BaseStyles.elementHeight,
                 color: r.fulfilled ? "green" : r.rejected ? "red" : null }} container row alignItems="center" justifyContent="space-between">
                 <Flex shrink="0" style={style.table.column}>{r.text}</Flex>
                 <Flex shrink="1" wrap container alignItems="center" justifyContent="flex-end" style={style.table.column}>
                   <UserLink user={r.user} />
                 </Flex>
               </Flex>
               )}
             </Flex>
           </FlexControlBlock>
         );
        }}
      </CollectionView>
    </SideMargins>
  );
}

export default TransactionDetail;
