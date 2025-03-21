import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import {createTheme, ThemeProvider, styled} from '@mui/material/styles';
import getSignUpTheme from '../customizations/getSignUpTheme';
import {GoogleIcon, FacebookIcon, SitemarkIcon} from './CustomIcon';
import TemplateFrame from "../customizations/TemplateFrame";

const Card = styled(MuiCard)(({theme}) => ({
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'center',
    width: '100%',
    padding: theme.spacing(4),
    gap: theme.spacing(2),
    margin: 'auto',
    boxShadow:
        'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
    [theme.breakpoints.up('sm')]: {
        width: '450px',
    },
    ...theme.applyStyles('dark', {
        boxShadow:
            'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
    }),
}));

const SignUpContainer = styled(Stack)(({theme}) => ({
    minHeight: '100%',
    padding: theme.spacing(2),
    [theme.breakpoints.up('sm')]: {
        padding: theme.spacing(4),
    },
    backgroundImage:
        'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
    backgroundRepeat: 'no-repeat',
    ...theme.applyStyles('dark', {
        backgroundImage:
            'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
    }),
}));

export default function SignUp() {
    const [mode, setMode] = React.useState('light');
    const [showCustomTheme, setShowCustomTheme] = React.useState(true);
    const defaultTheme = createTheme({palette: {mode}});
    const SignUpTheme = createTheme(getSignUpTheme(mode));
    const [firstNameError, setFirstNameError] = React.useState(false);
    const [firstNameErrorMessage, setFirstNameErrorMessage] = React.useState('');
    const [lastNameError, setLastNameError] = React.useState(false);
    const [lastNameErrorMessage, setLastNameErrorMessage] = React.useState('');
    const [emailError, setEmailError] = React.useState(false);
    const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
    const [passwordError, setPasswordError] = React.useState(false);
    const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
    const [passwordRepeatError, setPasswordRepeatError] = React.useState(false);
    const [passwordRepeatErrorMessage, setPasswordRepeatErrorMessage] = React.useState('');

    // This code only runs on the client side, to determine the system color preference
    React.useEffect(() => {
        // Check if there is a preferred mode in localStorage
        const savedMode = localStorage.getItem('themeMode');
        if (savedMode) {
            setMode(savedMode);
        } else {
            // If no preference is found, it uses system preference
            const systemPrefersDark = window.matchMedia(
                '(prefers-color-scheme: dark)',
            ).matches;
            setMode(systemPrefersDark ? 'dark' : 'light');
        }
    }, []);

    const toggleColorMode = () => {
        const newMode = mode === 'dark' ? 'light' : 'dark';
        setMode(newMode);
        localStorage.setItem('themeMode', newMode); // Save the selected mode to localStorage
    };

    const toggleCustomTheme = () => {
        setShowCustomTheme((prev) => !prev);
    };

    const validateInputs = () => {
        const email = document.getElementById('email');
        const password = document.getElementById('password');
        const passwordRepeat = document.getElementById('passwordRepeat');
        const fistName = document.getElementById('firstName');
        const lastName = document.getElementById('lastName');


        let isValid = true;

        if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
            setEmailError(true);
            setEmailErrorMessage('Email không được để trống và phải có định dạng email.');
            isValid = false;
        } else {
            setEmailError(false);
            setEmailErrorMessage('');
        }

        if (!password.value || password.value.length < 6) {
            setPasswordError(true);
            setPasswordErrorMessage('Mật khẩu không được để trống và phải có ít nhất 6 ký tự.');
            isValid = false;
        } else {
            setPasswordError(false);
            setPasswordErrorMessage('');
        }

        if (!passwordRepeat.value || passwordRepeat.value.length < 6) {
            setPasswordRepeatError(true);
            setPasswordRepeatErrorMessage('Mật khẩu không được để trống và phải có ít nhất 6 ký tự.');
            isValid = false;
        } else {
            setPasswordRepeatError(false);
            setPasswordRepeatErrorMessage('');
        }

        if (password.value !== passwordRepeat.value) {
            setPasswordError(true);
            setPasswordRepeatError(true);
            setPasswordErrorMessage('Mật khẩu không trùng khớp.');
            setPasswordRepeatErrorMessage('Mật khẩu không trùng khớp.');
            isValid = false;
        } else {
            setPasswordError(false);
            setPasswordRepeatError(false);
            setPasswordErrorMessage('');
            setPasswordRepeatErrorMessage('');
        }

        if (!fistName.value || fistName.value.length < 1) {
            setFirstNameError(true);
            setFirstNameErrorMessage('Tên không được để trống.');
            isValid = false;
        } else {
            setFirstNameError(false);
            setFirstNameErrorMessage('');
        }

        if (!lastName.value || lastName.value.length < 1) {
            setLastNameError(true);
            setLastNameErrorMessage('Họ không được để trống.');
            isValid = false;
        } else {
            setLastNameError(false);
            setLastNameErrorMessage('');
        }

        return isValid;
    };

    const handleSubmit = (event) => {
        if (emailError || passwordError || passwordRepeatError || firstNameError || lastNameError) {
            event.preventDefault();
            return;
        }
        const data = new FormData(event.currentTarget);
        console.log({
            email: data.get('email'),
            password: data.get('password'),
            firstName: data.get('firstName'),
            lastName: data.get('lastName'),
        });

        // gọi api đăng ký tài khoản ở đây

    };

    return (
        <TemplateFrame
            toggleCustomTheme={toggleCustomTheme}
            showCustomTheme={showCustomTheme}
            mode={mode}
            toggleColorMode={toggleColorMode}
        >
            <ThemeProvider theme={showCustomTheme ? SignUpTheme : defaultTheme}>
                <CssBaseline enableColorScheme/>
                <SignUpContainer direction="column" justifyContent="space-between">
                    <Card variant="outlined">
                        <SitemarkIcon/>
                        <Typography
                            component="h1"
                            variant="h4"
                            sx={{width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)'}}
                        >
                            Đăng ký
                        </Typography>
                        <Box
                            component="form"
                            onSubmit={handleSubmit}
                            sx={{display: 'flex', flexDirection: 'column', gap: 2}}
                        >
                            <FormControl>
                                <FormLabel htmlFor="firstName">Tên</FormLabel>
                                <TextField
                                    autoComplete="firstName"
                                    name="firstName"
                                    required
                                    fullWidth
                                    id="firstName"
                                    placeholder="Tên của bạn"
                                    error={firstNameError}
                                    helperText={firstNameErrorMessage}
                                    color={firstNameError ? 'error' : 'primary'}
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel htmlFor="lastName">Họ</FormLabel>
                                <TextField
                                    autoComplete="lastName"
                                    name="lastName"
                                    required
                                    fullWidth
                                    id="lastName"
                                    placeholder="Họ của bạn"
                                    error={lastNameError}
                                    helperText={lastNameErrorMessage}
                                    color={lastNameError ? 'error' : 'primary'}
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel htmlFor="email">Email</FormLabel>
                                <TextField
                                    required
                                    fullWidth
                                    id="email"
                                    placeholder="your@email.com"
                                    name="email"
                                    autoComplete="email"
                                    variant="outlined"
                                    error={emailError}
                                    helperText={emailErrorMessage}
                                    color={passwordError ? 'error' : 'primary'}
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel htmlFor="password">Mật khẩu</FormLabel>
                                <TextField
                                    required
                                    fullWidth
                                    name="password"
                                    placeholder="••••••"
                                    type="password"
                                    id="password"
                                    autoComplete="new-password"
                                    variant="outlined"
                                    error={passwordError}
                                    helperText={passwordErrorMessage}
                                    color={passwordError ? 'error' : 'primary'}
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel htmlFor="passwordRepeat">Nhập lại mật khẩu</FormLabel>
                                <TextField
                                    required
                                    fullWidth
                                    name="passwordRepeat"
                                    placeholder="••••••"
                                    type="password"
                                    id="passwordRepeat"
                                    autoComplete="new-password"
                                    variant="outlined"
                                    error={passwordRepeatError}
                                    helperText={passwordRepeatErrorMessage}
                                    color={passwordRepeatError ? 'error' : 'primary'}
                                />
                            </FormControl>
                            {/*<FormControlLabel*/}
                            {/*    control={<Checkbox value="allowExtraEmails" color="primary"/>}*/}
                            {/*    label="I want to receive updates via email."*/}
                            {/*/>*/}
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                onClick={validateInputs}
                            >
                                Đăng ký
                            </Button>
                            <Typography sx={{textAlign: 'center'}}>
                                Bạn đã có tài khoản?{' '}
                                <span>
                  <Link
                      href="/login"
                      variant="body2"
                      sx={{alignSelf: 'center'}}
                  >
                    Đăng nhập
                  </Link>
                </span>
                            </Typography>
                        </Box>
                        <Divider>
                            <Typography sx={{color: 'text.secondary'}}>hoặc</Typography>
                        </Divider>
                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={() => alert('Sign up with Google')}
                                startIcon={<GoogleIcon/>}
                            >
                                Đăng ký với Google
                            </Button>
                            {/*<Button*/}
                            {/*    fullWidth*/}
                            {/*    variant="outlined"*/}
                            {/*    onClick={() => alert('Sign up with Facebook')}*/}
                            {/*    startIcon={<FacebookIcon/>}*/}
                            {/*>*/}
                            {/*    Đăng ký với Facebook*/}
                            {/*</Button>*/}
                        </Box>
                    </Card>
                </SignUpContainer>
            </ThemeProvider>
        </TemplateFrame>
    );
}