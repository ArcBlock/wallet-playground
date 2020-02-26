![@arcblock/did-react](https://www.arcblock.io/.netlify/functions/badge/?text=did-react)

> UI components that can be used in React Applications built on top of forge powered blockchain.

## Usage

```shell
yarn add @arcblock/did-react
```

Then:

```javascript
import axios from 'axios';
import DidAuth from '@arcblock/did-react/lib/Auth';
import DidAvatar from '@arcblock/did-react/lib/Avatar';
import DidLogo from '@arcblock/did-react/lib/Logo';
import DidAddress from '@arcblock/did-react/lib/Address';
```

### DidAuth

```jsx
<DidAuth
  action="login"
  responsive
  checkFn={axios.get}
  onClose={() => toggle()}
  onSuccess={() => (window.location.href = '/profile')}
  messages={{
    title: 'login',
    scan: 'Scan QR code with ABT Wallet',
    confirm: 'Confirm login on your ABT Wallet',
    success: 'You have successfully signed in!',
  }}
/>
```

### DidAvatar

```jsx
<DidAvatar did={userDid} size={256} />
```

### DidLogo

```jsx
<DidLogo size={32} />
```

### DidAddress

```jsx
<DidAddress did={userDid} size={32} />
```
