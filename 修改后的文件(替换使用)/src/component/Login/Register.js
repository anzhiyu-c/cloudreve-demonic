import React, { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import RegIcon from "@material-ui/icons/AssignmentIndOutlined";
import {
    Avatar,
    Button,
    Divider,
    FormControl,
    Input,
    InputLabel,
    Link,
    makeStyles,
    Paper,
    Typography,
} from "@material-ui/core";
import { useHistory } from "react-router-dom";
import API from "../../middleware/Api";
import EmailIcon from "@material-ui/icons/EmailOutlined";
import { useCaptcha } from "../../hooks/useCaptcha";
import { toggleSnackbar } from "../../redux/explorer";

import styled from "styled-components";

const useStyles = makeStyles((theme) => ({
    layout: {
        width: "auto",
        // marginTop: "110px",
        marginLeft: theme.spacing(3),
        marginRight: theme.spacing(3),
        [theme.breakpoints.up("sm")]: {
            width: 400,
            marginLeft: "auto",
            marginRight: "auto",
        },
        // marginBottom: 110,
    },
    paper: {
        // marginTop: theme.spacing(8),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: `${theme.spacing(2)}px ${theme.spacing(3)}px ${theme.spacing(
            3
        )}px`,
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: "100%", // Fix IE 11 issue.
        marginTop: theme.spacing(1),
    },
    submit: {
        marginTop: theme.spacing(3),
    },
    link: {
        marginTop: "20px",
        display: "flex",
        width: "100%",
        justifyContent: "space-between",
    },
    captchaContainer: {
        display: "flex",
        marginTop: "10px",
        [theme.breakpoints.down("sm")]: {
            display: "block",
        },
    },
    captchaPlaceholder: {
        width: 200,
    },
    buttonContainer: {
        display: "flex",
    },
    authnLink: {
        textAlign: "center",
        marginTop: 16,
    },
    avatarSuccess: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.primary.main,
    },
}));

const MyStyled = styled.div`
    @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@200;300;400;500;600;700;800&display=swap");
    body,
    input {
        font-family: "Poppins", sans-serif;
    }

    .input-field {
        max-width: 380px;
        width: 100%;
        background-color: #f0f0f0;
        margin: 10px 0;
        height: 45px;
        border-radius: 55px;
        display: grid;
        grid-template-columns: 15% 85%;
        padding: 0 0.4rem;
        position: relative;
    }

    .input-field i {
        text-align: center;
        line-height: 45px;
        color: #acacac;
        transition: 0.5s;
        font-size: 1.1rem;
    }

    .input-field input {
        background: none;
        outline: none;
        border: none;
        line-height: 1;
        font-weight: 600;
        font-size: 1.1rem;
        color: #333;
    }

    .input-field input::placeholder {
        color: #aaa;
        font-weight: 500;
    }

    .social-text {
        padding: 0.7rem 0;
        font-size: 1rem;
    }

    .social-media {
        display: flex;
        justify-content: center;
    }

    .social-icon {
        height: 46px;
        width: 46px;
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 0 0.45rem;
        color: #333;
        border-radius: 50%;
        border: 1px solid #333;
        text-decoration: none;
        font-size: 1.1rem;
        transition: 0.3s;
        background-color: #fff;
    }

    .social-icon:hover {
        color: #4481eb;
        border-color: #4481eb;
        cursor: pointer;
    }

    .rgbtn {
        width: 100%;
        background-color: #5995fd;
        border: none;
        outline: none;
        height: 49px;
        border-radius: 49px;
        color: #fff;
        text-transform: uppercase;
        font-weight: 600;
        margin: 10px 0;
        cursor: pointer;
        transition: 0.5s;
        &:hover {
            background-color: #4d84e2;
        }
    }
`;

function Register(props) {
    const [input, setInput] = useState({
        email: "",
        password: "",
        password_repeat: "",
    });
    const [loading, setLoading] = useState(false);
    const [emailActive, setEmailActive] = useState(false);

    const title = useSelector((state) => state.siteConfig.title);
    const regCaptcha = useSelector((state) => state.siteConfig.regCaptcha);

    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );
    const history = useHistory();

    const handleInputChange = (name) => (e) => {
        setInput({
            ...input,
            [name]: e.target.value,
        });
    };

    const {
        captchaLoading,
        isValidate,
        validate,
        CaptchaRender,
        captchaRefreshRef,
        captchaParamsRef,
    } = useCaptcha();
    const classes = useStyles();

    const handleToggle = () => props.handleToggle();

    const register = (e) => {
        e.preventDefault();

        if (input.password !== input.password_repeat) {
            ToggleSnackbar("top", "right", "两次密码输入不一致", "warning");
            return;
        }

        setLoading(true);
        if (!isValidate.current.isValidate && regCaptcha) {
            validate(() => register(e), setLoading);
            return;
        }
        API.post("/user", {
            userName: input.email,
            Password: input.password,
            ...captchaParamsRef.current,
        })
            .then((response) => {
                setLoading(false);
                if (response.rawData.code === 203) {
                    setEmailActive(true);
                } else {
                    const Key = sessionStorage.getItem("Key");

                    history.push("/login?username=" + input.email);
                    props.handleToggle();
                    ToggleSnackbar("top", "right", "注册成功", "success");
                }
            })
            .catch((error) => {
                setLoading(false);
                ToggleSnackbar("top", "right", error.message, "warning");
                captchaRefreshRef.current();
            });
    };

    return (
        <MyStyled className={classes.layout}>
            <>
                {!emailActive && (
                    <Paper className={classes.paper}>
                        <Avatar className={classes.avatar}>
                            <RegIcon />
                        </Avatar>
                        <Typography component="h1" variant="h5">
                            注册 {title}
                        </Typography>

                        <form className={classes.form} onSubmit={register}>
                            <div className="input-field">
                                <i className="fas fa-user"></i>
                                <input
                                    id="register_email"
                                    type="email"
                                    name="email"
                                    onChange={handleInputChange("email")}
                                    autoComplete
                                    value={input.email}
                                    autoFocus
                                    placeholder="电子邮箱"
                                    required
                                />
                            </div>

                            <div className="input-field">
                                <i className="fas fa-lock"></i>
                                <input
                                    placeholder="密码"
                                    name="password"
                                    onChange={handleInputChange("password")}
                                    type="password"
                                    id="register_password"
                                    value={input.password}
                                    autoComplete
                                    required
                                />
                            </div>

                            <div className="input-field">
                                <i className="fas fa-lock"></i>
                                <input
                                    placeholder="确认密码"
                                    name="pwdRepeat"
                                    onChange={handleInputChange(
                                        "password_repeat"
                                    )}
                                    type="password"
                                    id="pwdRepeat"
                                    value={input.password_repeat}
                                    autoComplete
                                    required
                                />
                            </div>
                            {/* <FormControl margin="normal" required fullWidth>
                                <InputLabel htmlFor="register_email">
                                    电子邮箱
                                </InputLabel>
                                <Input
                                    id="register_email"
                                    type="email"
                                    name="email"
                                    onChange={handleInputChange("email")}
                                    autoComplete
                                    value={input.email}
                                    autoFocus
                                />
                            </FormControl>
                            <FormControl margin="normal" required fullWidth>
                                <InputLabel htmlFor="register_password">
                                    密码
                                </InputLabel>
                                <Input
                                    name="password"
                                    onChange={handleInputChange("password")}
                                    type="password"
                                    id="register_password"
                                    value={input.password}
                                    autoComplete
                                />
                            </FormControl>
                            <FormControl margin="normal" required fullWidth>
                                <InputLabel htmlFor="password">
                                    确认密码
                                </InputLabel>
                                <Input
                                    name="pwdRepeat"
                                    onChange={handleInputChange(
                                        "password_repeat"
                                    )}
                                    type="password"
                                    id="pwdRepeat"
                                    value={input.password_repeat}
                                    autoComplete
                                />
                            </FormControl> */}
                            {regCaptcha && <CaptchaRender />}

                            <input
                                type="submit"
                                variant="contained"
                                color="primary"
                                disabled={
                                    loading ||
                                    (regCaptcha ? captchaLoading : false)
                                }
                                value="注册账号"
                                className={`rgbtn solid`}
                            />
                        </form>

                        <Divider />
                        <div className={classes.link}>
                            <div>
                                <Link
                                    onClick={handleToggle}
                                    style={{ cursor: "pointer" }}
                                >
                                    返回登录
                                </Link>
                            </div>
                            <div>
                                <Link
                                    target="_blank"
                                    href={"https://forum.anzhiy.cn/d/29"}
                                >
                                    注册协议
                                </Link>
                            </div>
                        </div>
                    </Paper>
                )}
                {emailActive && (
                    <Paper className={classes.paper}>
                        <Avatar className={classes.avatarSuccess}>
                            <EmailIcon />
                        </Avatar>
                        <Typography component="h1" variant="h5">
                            邮件激活
                        </Typography>
                        <Typography style={{ marginTop: "10px" }}>
                            一封激活邮件已经发送至您的邮箱，请访问邮件中的链接以继续完成注册。
                        </Typography>
                    </Paper>
                )}
            </>
        </MyStyled>
    );
}

export default Register;