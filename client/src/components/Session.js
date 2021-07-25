import React, { useState, useEffect } from 'react'
import { apiURl } from '../api'
import { deleteCookie } from '../utils'
import API from "./mockAPI";
import "./styles.css";

const Session = ({ history }) => {
  const [state, setState] = useState({
    isFetching: false,
    message: null,
    user: null,
  })
  const [cart, setCart] = useState(API);

  const addToCart = i => {
    setCart(prevState =>
      prevState.map((item, o) => {
        if (i === o) {
          return {
            ...item,
            inCart: true,
            count: item.counterVal
          };
        }
        return item;
      })
    );
  };

  const increaseQuantity = i => {
    setCart(prevCart =>
      prevCart.map((item, o) => {
        if (i === o && item.inCart) {
          if (item.count > 9) {
            return item;
          } else return { ...item, count: item.count + 1 };
        } else if (i === o) {
          if (item.counterVal > 9) {
            return item;
          } else
            return {
              ...item,
              counterVal: item.counterVal + 1
            };
        }
        return item;
      })
    );
  };

  const decreaseQuantity = i => {
    setCart(prevCart =>
      prevCart.map((item, o) => {
        if (i === o && item.inCart) {
          if (item.count > 1) {
            return { ...item, count: item.count - 1 };
          } else {
            return item;
          }
        } else if (i === o && item.counterVal > 1) {
          return {
            ...item,
            counterVal: item.counterVal - 1
          };
        }
        return item;
      })
    );
  };

  const removeFromCart = i => {
    setCart(prevCart =>
      prevCart.map((item, o) => {
        if (i === o) {
          return {
            ...item,
            count: 0,
            counterVal: 1,
            inCart: false
          };
        }
        return item;
      })
    );
  };

  const cartCountTotal = cart.reduce((acc, item) => acc + item.count, 0);
  const cartPriceTotal = cart.reduce(
    (acc, item) => acc + item.price * item.count,
    0
  );

  const cartTotals = () =>
    cartCountTotal === 0 ? (
      <b>Cart is empty</b>
    ) : (
      <div>
        <b>
          <p>Items in Cart: {cartCountTotal}</p>
          <p>
            Total Price: $
            {Number.isInteger(cartPriceTotal)
              ? cartPriceTotal
              : cartPriceTotal.toFixed(2)}
          </p>
        </b>
      </div>
    );

  const cartItems = cart.map((item, i) => (
    <React.Fragment key={item.name}>
      {item.inCart && (
        <div>
          <p> Item Name: {item.name}</p>
          <img src={item.image} alt=""/>
          <p>
            Item Count: <button        style={{ height: '30px' }} onClick={() => decreaseQuantity(i)}>-</button>{" "}
            {item.count} <button        style={{ height: '30px' }} onClick={() => increaseQuantity(i)}>+</button>
          </p>
          <p>
            Item Subtotal: $
            {Number.isInteger(item.count * item.price)
              ? item.count * item.price
              : `${(item.count * item.price).toFixed(2)}`}
          </p>
          <button        style={{ height: '30px' }} onClick={() => removeFromCart(i)}>Remove From Cart</button>
          <hr />
        </div>
      )}
    </React.Fragment>
  ));

  const cartProducts = () => (
    <div className="flexParent">
      {cart.map((item, i) => (
        <div key={item.name}>
          <p>{item.name}</p>
          <p>Price: ${item.price}</p>
          {!item.inCart ? (
            <div>
              <button        style={{ height: '30px' }} onClick={() => decreaseQuantity(i)}>-</button>
              <input readOnly type="text" value={item.counterVal} />
              <button        style={{ height: '30px' }} onClick={() => increaseQuantity(i)}>+</button>
              <br />
              <button        style={{ height: '30px' }} onClick={() => addToCart(i)}>add</button>
            </div>
          ) : (
            <p>
              <b>Item added!</b>
            </p>
          )}
        </div>
      ))}
    </div>
  );
  const { isFetching, message, user = {} } = state

  const getUserInfo = async () => {
    setState({ ...state, isFetching: true, message: 'fetching details...' })
    try {
      const res = await fetch(`${apiURl}/session`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          Authorization: document.cookie,
        },
      }).then(res => res.json())

      const { success, user } = res
      if (!success) {
        history.push('/login')
      }
      setState({ ...state, user, message: null, isFetching: false })
    } catch (e) {
      setState({ ...state, message: e.toString(), isFetching: false })
    }
  }

  const handleLogout = () => {
    deleteCookie('token')
    history.push('/login')
  }

  useEffect(() => {
    if (history.location.state) {
      return setState({ ...state, user: { ...history.location.state } })
    }
    getUserInfo()
  }, [])

  return (
    <div>
            <div>
      {cartItems}
      {cartTotals()}
      {cartProducts()}
    </div>
    <div className="wrapper">
      <h1>Welcome, {user && user.name}</h1>
      {user && user.email}
      <div className="message">
        {isFetching ? 'fetching details..' : message}
      </div>

      <button
        style={{ height: '30px' }}
        onClick={() => {
         handleLogout()
        }}
      >
        logout
      </button>
    </div>
    </div>

  )
}

export default Session
