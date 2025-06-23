import {atom} from 'recoil';

type AuthModalState = {
  isOpen: boolean;
  type: 'login' | 'register' | 'forgotPassword';
}

const initialAuthModalState: AuthModalState = {
  isOpen: false,
  type: 'login', // Default type can be set to 'login' or 'register' as needed
};

export const authModalState = atom<AuthModalState>({
  key: 'authModalState',
  default: initialAuthModalState,
})