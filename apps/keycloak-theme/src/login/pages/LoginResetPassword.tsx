import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

export default function LoginResetPassword(props: PageProps<Extract<KcContext, { pageId: "login-reset-password.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { url, realm, auth, messagesPerField } = kcContext;

    const { msg, msgStr } = i18n;

    return (
        <Template
            kcContext={kcContext}
            i18n={i18n}
            doUseDefaultCss={doUseDefaultCss}
            classes={classes}
            displayMessage={!messagesPerField.existsError("username")}
            headerNode={msg("emailForgotTitle")}
        >
            <form id="kc-reset-password-form" action={url.loginAction} method="post" className="flex flex-col gap-4">
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
                        autoFocus
                        type="text"
                        autoComplete="username"
                        defaultValue={auth.attemptedUsername ?? ""}
                        aria-invalid={messagesPerField.existsError("username")}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5
                                   text-white placeholder-white/30 text-sm
                                   focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50
                                   aria-invalid:border-red-500/50 aria-invalid:ring-red-500/30
                                   transition-all"
                    />
                    {messagesPerField.existsError("username") && (
                        <span
                            id="input-error-username"
                            className="block mt-1.5 text-xs text-red-400"
                            aria-live="polite"
                        >
                            {messagesPerField.getFirstError("username")}
                        </span>
                    )}
                </div>

                <div id="kc-form-buttons" className="flex flex-col gap-3 mt-2">
                    <input
                        tabIndex={4}
                        type="submit"
                        value={msgStr("emailForgotTitle")}
                        className="w-full backdrop-blur-md bg-white/1 ring-1 ring-brand-500/60 text-brand-500 font-semibold py-2.5 rounded-lg
                                   hover:bg-brand-500/20 hover:ring-brand-500 active:bg-brand-500/30
                                   transition-all cursor-pointer"
                    />
                    <a
                        tabIndex={5}
                        href={url.loginUrl}
                        className="text-center text-xs text-white/50 hover:text-white/80 transition-colors"
                    >
                        {msg("backToLogin")}
                    </a>
                </div>
            </form>
        </Template>
    );
}
