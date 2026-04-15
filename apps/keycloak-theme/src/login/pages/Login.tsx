import type { JSX } from "keycloakify/tools/JSX";
import { useState } from "react";
import { kcSanitize } from "keycloakify/lib/kcSanitize";
import { useIsPasswordRevealed } from "keycloakify/tools/useIsPasswordRevealed";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { useScript } from "keycloakify/login/pages/Login.useScript";

export default function Login(props: PageProps<Extract<KcContext, { pageId: "login.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { social, realm, url, usernameHidden, login, auth, registrationDisabled, messagesPerField, enableWebAuthnConditionalUI, authenticators } =
        kcContext;

    const { msg, msgStr } = i18n;

    const [isLoginButtonDisabled, setIsLoginButtonDisabled] = useState(false);

    const webAuthnButtonId = "authenticateWebAuthnButton";

    useScript({
        webAuthnButtonId,
        kcContext,
        i18n
    });

    return (
        <Template
            kcContext={kcContext}
            i18n={i18n}
            doUseDefaultCss={doUseDefaultCss}
            classes={classes}
            displayMessage={!messagesPerField.existsError("username", "password")}
            headerNode={msg("loginAccountTitle")}
            displayInfo={realm.password && realm.registrationAllowed && !registrationDisabled}
            infoNode={
                <span>
                    {msg("noAccount")}{" "}
                    <a tabIndex={8} href={url.registrationUrl} className="text-brand-500 hover:text-brand-400 transition-colors">
                        {msg("doRegister")}
                    </a>
                </span>
            }
            socialProvidersNode={
                <>
                    {realm.password && social?.providers !== undefined && social.providers.length !== 0 && (
                        <div id="kc-social-providers" className="mt-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex-1 h-px bg-white/10" />
                                <span className="text-xs text-white/30">{msg("identity-provider-login-label")}</span>
                                <div className="flex-1 h-px bg-white/10" />
                            </div>
                            <ul className="flex flex-col gap-2">
                                {social.providers.map(p => (
                                    <li key={p.alias}>
                                        <a
                                            id={`social-${p.alias}`}
                                            href={p.loginUrl}
                                            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg
                                                       glass-item
                                                       text-sm text-white/80 hover:text-white hover:bg-white/10
                                                       transition-all cursor-pointer"
                                        >
                                            {p.iconClasses && <i className={p.iconClasses} aria-hidden="true" />}
                                            <span dangerouslySetInnerHTML={{ __html: kcSanitize(p.displayName) }} />
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </>
            }
        >
            <div id="kc-form">
                <div id="kc-form-wrapper">
                    {realm.password && (
                        <form
                            id="kc-form-login"
                            onSubmit={() => {
                                setIsLoginButtonDisabled(true);
                                return true;
                            }}
                            action={url.loginAction}
                            method="post"
                            className="flex flex-col gap-4"
                        >
                            {!usernameHidden && (
                                <div>
                                    <label htmlFor="username" className="block text-xs font-medium text-white/60 uppercase tracking-wider mb-1.5">
                                        {!realm.loginWithEmailAllowed
                                            ? msg("username")
                                            : !realm.registrationEmailAsUsername
                                              ? msg("usernameOrEmail")
                                              : msg("email")}
                                    </label>
                                    <input
                                        tabIndex={2}
                                        id="username"
                                        name="username"
                                        defaultValue={login.username ?? ""}
                                        type="text"
                                        autoFocus
                                        autoComplete={enableWebAuthnConditionalUI ? "username webauthn" : "username"}
                                        aria-invalid={messagesPerField.existsError("username", "password")}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5
                                                   text-white placeholder-white/30 text-sm
                                                   focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50
                                                   aria-invalid:border-red-500/50 aria-invalid:ring-red-500/30
                                                   transition-all"
                                    />
                                    {messagesPerField.existsError("username", "password") && (
                                        <span
                                            id="input-error"
                                            className="block mt-1.5 text-xs text-red-400"
                                            aria-live="polite"
                                            dangerouslySetInnerHTML={{
                                                __html: kcSanitize(messagesPerField.getFirstError("username", "password"))
                                            }}
                                        />
                                    )}
                                </div>
                            )}

                            <div>
                                <label htmlFor="password" className="block text-xs font-medium text-white/60 uppercase tracking-wider mb-1.5">
                                    {msg("password")}
                                </label>
                                <PasswordWrapper i18n={i18n} passwordInputId="password">
                                    <input
                                        tabIndex={3}
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        aria-invalid={messagesPerField.existsError("username", "password")}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 pr-11
                                                   text-white placeholder-white/30 text-sm
                                                   focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50
                                                   aria-invalid:border-red-500/50 aria-invalid:ring-red-500/30
                                                   transition-all"
                                    />
                                </PasswordWrapper>
                                {usernameHidden && messagesPerField.existsError("username", "password") && (
                                    <span
                                        id="input-error"
                                        className="block mt-1.5 text-xs text-red-400"
                                        aria-live="polite"
                                        dangerouslySetInnerHTML={{
                                            __html: kcSanitize(messagesPerField.getFirstError("username", "password"))
                                        }}
                                    />
                                )}
                            </div>

                            <div className="flex items-center justify-between">
                                {realm.rememberMe && !usernameHidden && (
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            tabIndex={5}
                                            id="rememberMe"
                                            name="rememberMe"
                                            type="checkbox"
                                            defaultChecked={!!login.rememberMe}
                                            className="rounded border-white/20 bg-white/5 text-brand-500 focus:ring-brand-500/50"
                                            style={{ accentColor: "#ff5e1f" }}
                                        />
                                        <span className="text-xs text-white/50">{msg("rememberMe")}</span>
                                    </label>
                                )}
                                {realm.resetPasswordAllowed && (
                                    <a
                                        tabIndex={6}
                                        href={url.loginResetCredentialsUrl}
                                        className="text-xs text-brand-500 hover:text-brand-400 transition-colors ml-auto"
                                    >
                                        {msg("doForgotPassword")}
                                    </a>
                                )}
                            </div>

                            <div id="kc-form-buttons" className="mt-2">
                                <input type="hidden" id="id-hidden-input" name="credentialId" value={auth.selectedCredential} />
                                <input
                                    tabIndex={7}
                                    disabled={isLoginButtonDisabled}
                                    name="login"
                                    id="kc-login"
                                    type="submit"
                                    value={msgStr("doLogIn")}
                                    className="w-full backdrop-blur-md bg-white/1 ring-1 ring-brand-500/60 text-brand-500 font-semibold py-2.5 rounded-lg
                                               hover:bg-brand-500/20 hover:ring-brand-500 active:bg-brand-500/30
                                               transition-all cursor-pointer
                                               disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {enableWebAuthnConditionalUI && (
                <>
                    <form id="webauth" action={url.loginAction} method="post">
                        <input type="hidden" id="clientDataJSON" name="clientDataJSON" />
                        <input type="hidden" id="authenticatorData" name="authenticatorData" />
                        <input type="hidden" id="signature" name="signature" />
                        <input type="hidden" id="credentialId" name="credentialId" />
                        <input type="hidden" id="userHandle" name="userHandle" />
                        <input type="hidden" id="error" name="error" />
                    </form>

                    {authenticators !== undefined && authenticators.authenticators.length !== 0 && (
                        <form id="authn_select">
                            {authenticators.authenticators.map((authenticator, i) => (
                                <input key={i} type="hidden" name="authn_use_chk" readOnly value={authenticator.credentialId} />
                            ))}
                        </form>
                    )}

                    <div className="mt-4">
                        <input
                            id={webAuthnButtonId}
                            type="button"
                            value={msgStr("passkey-doAuthenticate")}
                            className="w-full glass-item text-white/80
                                       font-medium py-2.5 rounded-lg hover:bg-white/10 hover:text-white
                                       transition-all cursor-pointer"
                        />
                    </div>
                </>
            )}
        </Template>
    );
}

function PasswordWrapper(props: { i18n: I18n; passwordInputId: string; children: JSX.Element }) {
    const { i18n, passwordInputId, children } = props;

    const { msgStr } = i18n;

    const { isPasswordRevealed, toggleIsPasswordRevealed } = useIsPasswordRevealed({ passwordInputId });

    return (
        <div className="relative">
            {children}
            <button
                type="button"
                aria-label={msgStr(isPasswordRevealed ? "hidePassword" : "showPassword")}
                aria-controls={passwordInputId}
                onClick={toggleIsPasswordRevealed}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
            >
                {isPasswordRevealed ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                )}
            </button>
        </div>
    );
}
