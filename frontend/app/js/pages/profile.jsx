import { h, Component } from 'preact'; // eslint-disable-line no-unused-vars
import { XOverflowable, Frown, BTC, SideMargins } from 'app/common';
import { Table } from 'base/components/elements';
import { Anchor, Router, API, CollectionView, ElementView, Flex } from 'base/base';

import BaseStyles from 'base/style';
import { noSelect } from 'base/style/mixins';
import style from 'app/style';

const profileStyle = {
  primaryAvatar: {
    height: "7em",
    width: "7em",
    backgroundColor: "gray",
    borderRadius: BaseStyles.border.radius
  }
};

function User({ elementView }) {
  let user = elementView.getElement();
  return (
    <Flex container row alignItems="center">
      <Flex margin component='img' objectFit="contain" src={user.avatar_url} style={profileStyle.primaryAvatar} />
      <Flex margin>
        <div style={{ ...style.text.primary, marginBottom: BaseStyles.padding, marginLeft: BaseStyles.padding }}>{user.first_name || "First Name"} {user.last_name || "Last Name"}</div>
        <div style={{ ...style.text.secondary, margin: BaseStyles.padding }}>@{user.username}</div>
        {user.is_me && <Anchor href="/profile/edit" style={{ ...style.text.tertiary, margin: BaseStyles.padding }}>Edit Profile</Anchor>}
      </Flex>
    </Flex>
  );
}

function TransactionDirection({ transaction, userId }) {
  let direction = null;
  let user = null;
  if (transaction.sender.id === parseInt(userId)) {
    direction = "to";
    user = transaction.recipient;
  } else if (transaction.recipient.id === parseInt(userId)) {
    direction = "from";
    user = transaction.sender;
  }

  if (direction && user) {
    return (
      <Flex container alignItems="center" style={style.text.secondary}>
        <small>{direction}</small><span>&nbsp;{user.first_name} {user.last_name} (@{user.username})</span>
      </Flex>
    );
  }
  return null;
}

function TransactionCollectionBody({ collectionView, userId }) {
  let es = collectionView.getElements();

  if (es.length === 0) {
    let isMe = userId === API.getUserID();
    return (
      <div style={style.element.frownMessage}>
        <Frown large />
        <p style={noSelect()}>{isMe ? "No transactions...yet!" : "No mutual transactions..." }</p>
      </div>
    );
  }

  return (
    <XOverflowable>
      <Table striped selectable>
        <tbody>
          {es.map(obj =>
            <tr key={obj.id}
                onClick={() => Router.push("/transaction/" + obj.id)}
                style={{ color: obj.completed ? obj.success ? "green" : "yellow" : obj.rejected ? "red" : null }}>
              <td># {obj.id}</td>
              <Flex container component='td' alignItems="center"><BTC/><span>{parseFloat(obj.amount)}</span></Flex>
              <td><TransactionDirection transaction={obj} userId={userId} /></td>
            </tr>
          )}
        </tbody>
      </Table>
    </XOverflowable>
  );
}

function Profile({ matches }) {
  const userId = parseInt(matches.id);
  const isAuthenticatedUser = userId === API.getUserID();
  return (
    <SideMargins>
      <Flex container column alignItems="center">
        <Flex basis="50%">
          <ElementView collection={API.user} elementID={userId}>
            {elementView => {
              // if (elementView.getElement().is_me) return <EditableUser elementView={elementView} />;
              return <User elementView={elementView} />;
             }}
          </ElementView>
        </Flex>
        <Flex container column grow="1" basis="100%" style={{maxWidth:"100%", width: "100%"}}>
          <Flex container row justifyContent="center" wrap>
            {!isAuthenticatedUser &&
              <Anchor
                component='button'
                href={API.user.baseURL + userId + "/transaction/send"}
              >Send BTC</Anchor>}
              {!isAuthenticatedUser &&
              <Anchor
                component='button'
                href={API.user.baseURL + userId + "/transaction/receive"}
              >Receive BTC</Anchor>}
              {isAuthenticatedUser &&
              <Anchor
                component='button'
                href="/wallets"
              >Wallets</Anchor>}
              {isAuthenticatedUser &&
              <Anchor
                component='button'
                href="/required"
              >Required</Anchor>}
              {isAuthenticatedUser &&
               <button
                 onClick={() => {
                   API.networking("DELETE", "/token/clear", {}, {}).then(() => {
                     API.clearAuth();
                     Router.push("/");
                   });
                 }}
               >Log Out</button>}
          </Flex>
          <CollectionView collection={API.user.append("/" + userId + "/transactions")}>
            <TransactionCollectionBody userId={userId} />
          </CollectionView>
        </Flex>
      </Flex>
    </SideMargins>
  );
}

export default Profile;
