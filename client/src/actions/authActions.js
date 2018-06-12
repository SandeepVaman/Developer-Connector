import axios from 'axios';
import jwt_decode from 'jwt-decode';
import setAuthToken from '../utils/setAuthToken';
import { GET_ERRORS, SET_CURRENT_USER } from './types'; 
//Register User
export const registerUser = (userData, history) => dispatch =>{
    axios.post('/api/users/register', userData)
        .then(res => history.push('/login') )
        .catch(err => 
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data
            })
        );
};
//Logni - Get user token
export const loginUser = (userData) => dispatch =>{
    axios.post('/api/users/login', userData)
        .then(res=>{
            //Save to local Storage
            const {token} = res.data;
            //Set token to Local Storage
            localStorage.setItem('jwtToken', token);
            //Set token to auth header
            setAuthToken(token);
            //Decode Token to get User data
            const decoded = jwt_decode(token);
            //Set current user
            dispatch(setCurrentUser(decoded))

        })
        .catch(err=>{
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data
            })
        })
}

export const setCurrentUser = decoded =>{
    return {
        type: SET_CURRENT_USER,
        payload: decoded
    }
}

// Log out user
export const logoutUser = () => dispatch => {
    // Remove token from localStorage
    localStorage.removeItem('jwtToken');
    //Remove auth header for futire requests.
    setAuthToken(false);
    //Set current user to {} which will set isAuth false.
    dispatch(setCurrentUser({}));
};