import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
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
import Auth from "../../middleware/Auth";
import { bufferDecode, bufferEncode } from "../../utils/index";
import { Fingerprint, VpnKey } from "@material-ui/icons";
import VpnIcon from "@material-ui/icons/VpnKeyOutlined";
import { useLocation } from "react-router";
import { ICPFooter } from "../Common/ICPFooter";

import Register from "./Register";

import { useCaptcha } from "../../hooks/useCaptcha";
import {
    applyThemes,
    setSessionStatus,
    toggleSnackbar,
} from "../../redux/explorer";
import styled from "styled-components";

const MyStyled = styled.div`
    @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@200;300;400;500;600;700;800&display=swap");
    body,
    input {
        font-family: "Poppins", sans-serif;
    }

    .container {
        position: relative;
        width: 100%;
        background-color: #fff;
        min-height: calc(100vh - 64px);
        overflow: hidden;
        flex: 1 1 0;
    }

    .forms-container {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
    }

    .signin-signup {
        position: absolute;
        top: 48%;
        transform: translate(-50%, -50%);
        left: 75%;
        width: 28%;
        transition: 1s 0.7s ease-in-out;
        display: grid;
        grid-template-columns: 1fr;
        z-index: 5;
    }

    .sign-up-form {
        opacity: 0;
        z-index: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        transition: all 0.2s 0.7s;
        overflow: hidden;
        grid-column: 1 / 2;
        grid-row: 1 / 2;
    }

    .sign-in-form {
        z-index: 2;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        transition: all 0.2s 0.7s;
        overflow: hidden;
        grid-column: 1 / 2;
        grid-row: 1 / 2;
    }

    .title {
        font-size: 2.2rem;
        color: #444;
        margin-bottom: 10px;
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

    .btn {
        width: 150px;
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
    }

    .btn:hover {
        background-color: #4d84e2;
    }
    .panels-container {
        position: absolute;
        height: 100%;
        width: 100%;
        top: 0;
        left: 0;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
    }

    .container:before {
        content: "";
        position: absolute;
        height: 2000px;
        width: 2000px;
        top: -10%;
        right: 48%;
        transform: translateY(-50%);
        background-image: linear-gradient(-45deg, #4481eb 0%, #04befe 100%);
        transition: 1.8s ease-in-out;
        border-radius: 50%;
        z-index: 6;
    }

    .image {
        width: 100%;
        transition: transform 1.1s ease-in-out;
        transition-delay: 0.4s;
    }

    .panel {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        justify-content: space-around;
        text-align: center;
        z-index: 6;
    }

    .left-panel {
        pointer-events: all;
        padding: 3rem 17% 2rem 12%;
    }

    .right-panel {
        pointer-events: none;
        padding: 3rem 12% 2rem 17%;
    }

    .panel .content {
        color: #fff;
        transition: transform 0.9s ease-in-out;
        transition-delay: 0.6s;
    }

    .panel h3 {
        font-weight: 600;
        line-height: 1;
        font-size: 1.5rem;
    }

    .panel p {
        font-size: 0.95rem;
        padding: 0.7rem 0;
    }

    .btn.transparent {
        margin: 0;
        background: none;
        border: 2px solid #fff;
        width: 130px;
        height: 41px;
        font-weight: 600;
        font-size: 0.8rem;
    }

    .right-panel .image,
    .right-panel .content {
        transform: translateX(800px);
    }

    /* ANIMATION */

    .container.sign-up-mode:before {
        transform: translate(100%, -50%);
        right: 52%;
    }

    .container.sign-up-mode .left-panel .image,
    .container.sign-up-mode .left-panel .content {
        transform: translateX(-800px);
    }

    .container.sign-up-mode .signin-signup {
        left: 25%;
    }

    .container.sign-up-mode .sign-up-form {
        opacity: 1;
        z-index: 2;
    }

    .container.sign-up-mode .sign-in-form {
        opacity: 0;
        z-index: 1;
    }

    .container.sign-up-mode .right-panel .image,
    .container.sign-up-mode .right-panel .content {
        transform: translateX(0%);
    }

    .container.sign-up-mode .left-panel {
        pointer-events: none;
    }

    .container.sign-up-mode .right-panel {
        pointer-events: all;
    }

    @media (max-width: 870px) {
        .container {
            min-height: 800px;
            height: 100vh - 64px;
        }
        .signin-signup {
            width: 100%;
            top: 100%;
            transform: translate(-50%, -100%);
            transition: 1s 0.8s ease-in-out;
        }

        .signin-signup,
        .container.sign-up-mode .signin-signup {
            left: 50%;
        }

        .panels-container {
            grid-template-columns: 1fr;
            grid-template-rows: 1fr 2fr 1fr;
        }

        .panel {
            flex-direction: row;
            justify-content: space-around;
            align-items: center;
            padding: 2.5rem 8%;
            grid-column: 1 / 2;
        }

        .right-panel {
            grid-row: 3 / 4;
        }

        .left-panel {
            grid-row: 1 / 2;
        }

        .image {
            width: 200px;
            transition: transform 0.9s ease-in-out;
            transition-delay: 0.6s;
        }

        .panel .content {
            padding-right: 15%;
            transition: transform 0.9s ease-in-out;
            transition-delay: 0.8s;
        }

        .panel h3 {
            font-size: 1.2rem;
        }

        .panel p {
            font-size: 0.7rem;
            padding: 0.5rem 0;
        }

        .btn.transparent {
            width: 110px;
            height: 35px;
            font-size: 0.7rem;
        }

        .container:before {
            width: 1500px;
            height: 1500px;
            transform: translateX(-50%);
            left: 30%;
            bottom: 68%;
            right: initial;
            top: initial;
            transition: 2s ease-in-out;
        }

        .container.sign-up-mode:before {
            transform: translate(-50%, 100%);
            bottom: 32%;
            right: initial;
        }

        .container.sign-up-mode .left-panel .image,
        .container.sign-up-mode .left-panel .content {
            transform: translateY(-300px);
        }

        .container.sign-up-mode .right-panel .image,
        .container.sign-up-mode .right-panel .content {
            transform: translateY(0px);
        }

        .right-panel .image,
        .right-panel .content {
            transform: translateY(300px);
        }

        .container.sign-up-mode .signin-signup {
            top: 5%;
            transform: translate(-50%, 0);
        }
    }

    @media (max-width: 570px) {
        form {
            padding: 0 1.5rem;
        }

        .image {
            display: none;
        }
        .panel .content {
            padding: 0.5rem 1rem;
        }
        .container {
            padding: 1.5rem;
        }

        .container:before {
            bottom: 72%;
            left: 50%;
        }

        .container.sign-up-mode:before {
            bottom: 28%;
            left: 50%;
        }
    }
`;

const useStyles = makeStyles((theme) => ({
    paper: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: `${theme.spacing(2)}px ${theme.spacing(3)}px ${theme.spacing(
            3
        )}px !important`,
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: "100%", // Fix IE 11 issue.
        marginTop: theme.spacing(1),
        display: "contents",
    },
    link: {
        marginTop: "20px",
        display: "flex",
        width: "100%",
        justifyContent: "space-around",
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
        alignItems: "center",
    },
    authnLink: {
        textAlign: "center",
        marginTop: 10,
    },

    contentTheme: {
        backgroundColor: `${theme.palette.background.default} !important`,
    },
}));

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function LoginForm() {
    const [email, setEmail] = useState("");
    const [pwd, setPwd] = useState("");
    const [loading, setLoading] = useState(false);
    const [useAuthn, setUseAuthn] = useState(false);
    const [twoFA, setTwoFA] = useState(false);
    const [faCode, setFACode] = useState("");
    const [isActive, setActive] = useState(false);

    const loginCaptcha = useSelector((state) => state.siteConfig.loginCaptcha);
    const registerEnabled = useSelector(
        (state) => state.siteConfig.registerEnabled
    );
    const title = useSelector((state) => state.siteConfig.title);
    const QQLogin = useSelector((state) => state.siteConfig.QQLogin);
    const authn = useSelector((state) => state.siteConfig.authn);

    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );
    const ApplyThemes = useCallback(
        (theme) => dispatch(applyThemes(theme)),
        [dispatch]
    );
    const SetSessionStatus = useCallback(
        (status) => dispatch(setSessionStatus(status)),
        [dispatch]
    );

    const history = useHistory();
    const location = useLocation();
    const {
        captchaLoading,
        isValidate,
        validate,
        CaptchaRender,
        captchaRefreshRef,
        captchaParamsRef,
    } = useCaptcha();
    const query = useQuery();

    const classes = useStyles();

    useEffect(() => {
        setEmail(query.get("username"));
    }, [location]);

    const afterLogin = (data) => {
        Auth.authenticate(data);

        // 设置用户主题色
        if (data["preferred_theme"] !== "") {
            ApplyThemes(data["preferred_theme"]);
        }

        // 设置登录状态
        SetSessionStatus(true);

        history.push("/home");
        ToggleSnackbar("top", "right", "登录成功", "success");
        sessionStorage.removeItem("Key");
        localStorage.removeItem("siteConfigCache");
    };

    const authnLogin = (e) => {
        e.preventDefault();
        if (!navigator.credentials) {
            ToggleSnackbar("top", "right", "当前浏览器或环境不支持", "warning");

            return;
        }

        setLoading(true);

        API.get("/user/authn/" + email)
            .then((response) => {
                const credentialRequestOptions = response.data;
                console.log(credentialRequestOptions);
                credentialRequestOptions.publicKey.challenge = bufferDecode(
                    credentialRequestOptions.publicKey.challenge
                );
                credentialRequestOptions.publicKey.allowCredentials.forEach(
                    function (listItem) {
                        listItem.id = bufferDecode(listItem.id);
                    }
                );

                return navigator.credentials.get({
                    publicKey: credentialRequestOptions.publicKey,
                });
            })
            .then((assertion) => {
                const authData = assertion.response.authenticatorData;
                const clientDataJSON = assertion.response.clientDataJSON;
                const rawId = assertion.rawId;
                const sig = assertion.response.signature;
                const userHandle = assertion.response.userHandle;

                return API.post(
                    "/user/authn/finish/" + email,
                    JSON.stringify({
                        id: assertion.id,
                        rawId: bufferEncode(rawId),
                        type: assertion.type,
                        response: {
                            authenticatorData: bufferEncode(authData),
                            clientDataJSON: bufferEncode(clientDataJSON),
                            signature: bufferEncode(sig),
                            userHandle: bufferEncode(userHandle),
                        },
                    })
                );
            })
            .then((response) => {
                afterLogin(response.data);
            })
            .catch((error) => {
                console.log(error);
                ToggleSnackbar("top", "right", error.message, "warning");
            })
            .then(() => {
                setLoading(false);
            });
    };

    const login = (e) => {
        e.preventDefault();
        setLoading(true);
        if (!isValidate.current.isValidate && loginCaptcha) {
            validate(() => login(e), setLoading);
            return;
        }
        API.post("/user/session", {
            userName: email,
            Password: pwd,
            ...captchaParamsRef.current,
        })
            .then((response) => {
                setLoading(false);
                if (response.rawData.code === 203) {
                    setTwoFA(true);
                } else {
                    afterLogin(response.data);
                }
            })
            .catch((error) => {
                setLoading(false);
                ToggleSnackbar("top", "right", error.message, "warning");
                captchaRefreshRef.current();
            });
    };

    const initQQLogin = () => {
        setLoading(true);
        API.post("/user/qq")
            .then((response) => {
                window.location.href = response.data;
            })
            .catch((error) => {
                setLoading(false);
                ToggleSnackbar("top", "right", error.message, "warning");
            });
    };

    const twoFALogin = (e) => {
        e.preventDefault();
        setLoading(true);
        API.post("/user/2fa", {
            code: faCode,
        })
            .then((response) => {
                setLoading(false);
                afterLogin(response.data);
            })
            .catch((error) => {
                setLoading(false);
                ToggleSnackbar("top", "right", error.message, "warning");
            });
    };

    const handleToggle = (event) => {
        setActive(!isActive);
    };

    return (
        <MyStyled>
            <div
                className={`container ${classes.contentTheme} ${
                    isActive ? "sign-up-mode" : ""
                }`}
            >
                <div className="forms-container">
                    <div className="signin-signup">
                        {!twoFA && (
                            <>
                                <Paper
                                    className={`sign-in-form ${classes.paper}`}
                                >
                                    <Avatar className={classes.avatar}>
                                        <LockOutlinedIcon />
                                    </Avatar>
                                    <Typography component="h1" variant="h5">
                                        登录 {title}
                                    </Typography>
                                    {!useAuthn && (
                                        <form
                                            className={classes.form}
                                            onSubmit={login}
                                        >
                                            <div className="input-field">
                                                <i className="fas fa-user"></i>
                                                <input
                                                    id="email"
                                                    type="email"
                                                    name="email"
                                                    onChange={(e) =>
                                                        setEmail(e.target.value)
                                                    }
                                                    autoComplete
                                                    value={email}
                                                    autoFocus
                                                    required
                                                    placeholder="电子邮箱"
                                                />
                                            </div>

                                            <div className="input-field">
                                                <i className="fas fa-lock"></i>
                                                <input
                                                    type="password"
                                                    placeholder="密码"
                                                    name="password"
                                                    onChange={(e) =>
                                                        setPwd(e.target.value)
                                                    }
                                                    id="password"
                                                    value={pwd}
                                                    autoComplete
                                                    required
                                                />
                                            </div>

                                            {loginCaptcha && <CaptchaRender />}
                                            {QQLogin && (
                                                <div
                                                    className={
                                                        classes.buttonContainer
                                                    }
                                                >
                                                    <input
                                                        type="submit"
                                                        variant="contained"
                                                        color="primary"
                                                        disabled={loading}
                                                        value="登 录"
                                                        className="btn solid"
                                                    />
                                                    <div
                                                        className={`social-media ${classes.submit}`}
                                                        variant="contained"
                                                        color="secondary"
                                                        style={{
                                                            marginLeft: "10px",
                                                        }}
                                                        disabled={loading}
                                                        onClick={initQQLogin}
                                                    >
                                                        <button
                                                            className="social-icon"
                                                            onClick={
                                                                initQQLogin
                                                            }
                                                            disabled={loading}
                                                        >
                                                            <i className="fab fa-qq"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            {!QQLogin && (
                                                <input
                                                    type="submit"
                                                    fullWidth
                                                    variant="contained"
                                                    color="primary"
                                                    disabled={loading}
                                                    className="btn solid"
                                                />
                                            )}
                                        </form>
                                    )}
                                    {useAuthn && (
                                        <form className={classes.form}>
                                            <FormControl
                                                margin="normal"
                                                required
                                                fullWidth
                                            >
                                                <InputLabel htmlFor="email">
                                                    电子邮箱
                                                </InputLabel>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    name="email"
                                                    onChange={(e) =>
                                                        setEmail(e.target.value)
                                                    }
                                                    autoComplete
                                                    value={email}
                                                    autoFocus
                                                />
                                            </FormControl>
                                            <Button
                                                type="submit"
                                                fullWidth
                                                variant="contained"
                                                color="primary"
                                                disabled={
                                                    loading ||
                                                    (loginCaptcha
                                                        ? captchaLoading
                                                        : false)
                                                }
                                                onClick={authnLogin}
                                                className={classes.submit}
                                            >
                                                下一步
                                            </Button>
                                        </form>
                                    )}
                                    <Divider />
                                    <div className={classes.link}>
                                        <div>
                                            <Link
                                                href={"/forget"}
                                                color="primary"
                                            >
                                                忘记密码
                                            </Link>
                                        </div>
                                        <div>
                                            {registerEnabled && (
                                                <Link
                                                    onClick={handleToggle}
                                                    color="primary"
                                                    style={{
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    注册账号
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                    <ICPFooter />
                                    <div
                                        style={{
                                            textAlign: "center",
                                            marginTop: "20px",
                                        }}
                                    >
                                        ©2022 By
                                        <a
                                            href="https://cloud.anzhiy.cn/"
                                            style={{
                                                cursor: "pointer",
                                                color: "#1c6bbb",
                                                textDecoration: "none",
                                            }}
                                            one-link-mark="yes"
                                        >
                                              安知鱼云盘  
                                        </a>
                                        ||  
                                        <a
                                            href="https://www.cloud.anzhiy.cn/"
                                            target="_blank"
                                            rel="noreferrer"
                                            style={{
                                                cursor: "pointer",
                                                color: "#1c6bbb",
                                                textDecoration: "none",
                                            }}
                                            one-link-mark="yes"
                                        >
                                            云盘官网  
                                        </a>
                                        ||  
                                        <a
                                            href="https://forum.anzhiy.cn/"
                                            style={{
                                                cursor: "pointer",
                                                color: "#1c6bbb",
                                                textDecoration: "none",
                                            }}
                                            target="_blank"
                                            rel="noreferrer"
                                            one-link-mark="yes"
                                        >
                                            交流社区
                                        </a>
                                        ||  
                                        <a
                                            href="https://anzhiy.cn/"
                                            style={{
                                                cursor: "pointer",
                                                color: "#1c6bbb",
                                                textDecoration: "none",
                                            }}
                                            target="_blank"
                                            rel="noreferrer"
                                            one-link-mark="yes"
                                        >
                                            资源投稿
                                        </a>
                                        <div
                                            style={{
                                                color: "#ffffff",
                                                backgroundColor: "#49b1f5",
                                                padding: "5px",
                                                border: "1px solid #49b1f5",
                                                borderRadius: "10px",
                                                fontSize: "12px",
                                                clear: "both",
                                                maxWidth: "400px",
                                                textAlign: "center",
                                                lineHeight: "initial",
                                                margin: "auto",
                                            }}
                                        >
                                            谨防刷单兼职,网贷,金融,裸聊敲诈,赌博等诈骗,请立即举报
                                        </div>
                                    </div>
                                </Paper>

                                <div className="sign-up-form">
                                    <Register handleToggle={handleToggle} />
                                </div>

                                {authn && (
                                    <div className={classes.authnLink}>
                                        <Button
                                            color="primary"
                                            onClick={() =>
                                                setUseAuthn(!useAuthn)
                                            }
                                        >
                                            {!useAuthn && (
                                                <>
                                                    <Fingerprint
                                                        style={{
                                                            marginRight: 8,
                                                        }}
                                                    />
                                                    使用外部验证器登录
                                                </>
                                            )}
                                            {useAuthn && (
                                                <>
                                                    <VpnKey
                                                        style={{
                                                            marginRight: 8,
                                                        }}
                                                    />
                                                    使用密码登录
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                        {twoFA && (
                            <Paper className={classes.paper}>
                                <Avatar className={classes.avatar}>
                                    <VpnIcon />
                                </Avatar>
                                <Typography component="h1" variant="h5">
                                    二步验证
                                </Typography>
                                <form
                                    className={classes.form}
                                    onSubmit={twoFALogin}
                                >
                                    <FormControl
                                        margin="normal"
                                        required
                                        fullWidth
                                    >
                                        <InputLabel htmlFor="code">
                                            请输入六位二步验证代码
                                        </InputLabel>
                                        <Input
                                            id="code"
                                            type="number"
                                            name="code"
                                            onChange={(event) =>
                                                setFACode(event.target.value)
                                            }
                                            autoComplete
                                            value={faCode}
                                            autoFocus
                                        />
                                    </FormControl>
                                    <Button
                                        type="submit"
                                        fullWidth
                                        variant="contained"
                                        color="primary"
                                        disabled={loading}
                                        className={classes.submit}
                                    >
                                        继续登录
                                    </Button>{" "}
                                </form>{" "}
                                <Divider />
                            </Paper>
                        )}
                    </div>
                </div>

                <div className="panels-container">
                    <div className="panel left-panel">
                        <div className="content">
                            <h3>新用户?</h3>
                            <p>
                                好兄弟,你来了,我们的网站就差你的加入了,点击下方注册按钮加入我们吧!!
                            </p>
                            <button
                                className="btn transparent"
                                id="sign-up-btn"
                                onClick={handleToggle}
                            >
                                注册
                            </button>
                        </div>
                        <img
                            src={"/static/img/log.svg"}
                            className="image"
                            
                        />
                    </div>
                    <div className="panel right-panel">
                        <div className="content">
                            <h3>已经是我们自己人了吗?</h3>
                            <p>
                                那好兄弟,你直接点击登录按钮,登录到我们这优秀的系统里!!
                            </p>
                            <button
                                className="btn transparent"
                                id="sign-in-btn"
                                onClick={handleToggle}
                            >
                                登 录
                            </button>
                        </div>
                        <img
                            src={"/static/img/register.svg"}
                            className="image"
                            
                        />
                    </div>
                </div>
            </div>
        </MyStyled>
    );
}

export default LoginForm;