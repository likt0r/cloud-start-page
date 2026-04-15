import { useEffect, useRef, useState } from "react";
import { clsx } from "keycloakify/tools/clsx";
import { kcSanitize } from "keycloakify/lib/kcSanitize";
import type { TemplateProps } from "keycloakify/login/TemplateProps";
import { useSetClassName } from "keycloakify/tools/useSetClassName";
import { useInitialize } from "keycloakify/login/Template.useInitialize";
import type { I18n } from "./i18n";
import type { KcContext } from "./KcContext";
import MatrixRain from "./components/MatrixRain";
import logoUrl from "@cloud-start-page/assets/mean-robot.svg";

export default function Template(props: TemplateProps<KcContext, I18n>) {
    const {
        displayInfo = false,
        displayMessage = true,
        headerNode,
        socialProvidersNode = null,
        infoNode = null,
        documentTitle,
        bodyClassName,
        kcContext,
        i18n,
        doUseDefaultCss,
        children
    } = props;

    const { msg, msgStr, currentLanguage, enabledLanguages } = i18n;

    const { realm, auth, url, message, isAppInitiatedAction } = kcContext;

    const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
    const langMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        document.title = documentTitle ?? msgStr("loginTitle", realm.displayName || realm.name);
    }, []);

    // Close language dropdown when clicking outside
    useEffect(() => {
        if (!isLangMenuOpen) return;
        function onClickOutside(e: MouseEvent) {
            if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
                setIsLangMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", onClickOutside);
        return () => document.removeEventListener("mousedown", onClickOutside);
    }, [isLangMenuOpen]);

    useSetClassName({
        qualifiedName: "html",
        className: clsx(doUseDefaultCss && "")
    });

    useSetClassName({
        qualifiedName: "body",
        className: bodyClassName ?? ""
    });

    const { isReadyToRender } = useInitialize({ kcContext, doUseDefaultCss });

    if (!isReadyToRender) {
        return null;
    }

    return (
        // z-index: 0 on canvas, this wrapper z-index: 1 ensures content is above it
        <div className="relative z-1 min-h-screen flex items-center justify-center p-4">
            {/* Canvas sits at z-0 (body background level), content at z-1 */}
            <MatrixRain />

            <div className="relative z-10 w-full max-w-sm">
                {/* Language switcher */}
                {enabledLanguages.length > 1 && (
                    <div className="flex justify-end mb-4" ref={langMenuRef}>
                        <div className="relative">
                            <button
                                tabIndex={1}
                                id="kc-current-locale-link"
                                aria-label={msgStr("languages")}
                                aria-haspopup="true"
                                aria-expanded={isLangMenuOpen}
                                aria-controls="language-switch1"
                                onClick={() => setIsLangMenuOpen(v => !v)}
                                className="text-xs text-white/60 hover:text-white/90 transition-all px-3 py-1.5 rounded-lg glass-item hover:bg-white/10"
                            >
                                {currentLanguage.label} ▾
                            </button>
                            {isLangMenuOpen && (
                                <ul
                                    role="menu"
                                    tabIndex={-1}
                                    aria-labelledby="kc-current-locale-link"
                                    id="language-switch1"
                                    className="absolute right-0 mt-1 glass-popover rounded-lg py-1 z-50 min-w-[8rem]"
                                >
                                    {enabledLanguages.map(({ languageTag, label, href }, i) => (
                                        <li key={languageTag} role="none">
                                            <a
                                                role="menuitem"
                                                id={`language-${i + 1}`}
                                                href={href}
                                                className="block px-4 py-2 text-xs text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                                            >
                                                {label}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                )}

                {/* Logo — above the glassmorphism panel, centered */}
                <div className="flex justify-center mb-8">
                    <img src={logoUrl} alt={realm.displayName || realm.name} className="h-60 w-auto animate-logo-pulse" />
                </div>

                {/* Glassmorphism panel */}
                <div className="glass-panel rounded-xl p-8">
                    {/* Page title */}
                    <div className="mb-6 text-center">
                        {(() => {
                            if (!(auth !== undefined && auth.showUsername && !auth.showResetCredentials)) {
                                return (
                                    <h1 id="kc-page-title" className="text-xl font-semibold text-white">
                                        {headerNode}
                                    </h1>
                                );
                            }
                            return (
                                <div id="kc-username" className="flex items-center justify-center gap-2">
                                    <span className="text-sm text-white/70">{auth.attemptedUsername}</span>
                                    <a
                                        id="reset-login"
                                        href={url.loginRestartFlowUrl}
                                        aria-label={msgStr("restartLoginTooltip")}
                                        className="text-accent-500 hover:text-accent-400 transition-colors text-xs"
                                    >
                                        {msg("restartLoginTooltip")}
                                    </a>
                                </div>
                            );
                        })()}
                    </div>

                    {/* Alert messages */}
                    {displayMessage && message !== undefined && (message.type !== "warning" || !isAppInitiatedAction) && (
                        <div
                            className={clsx(
                                "mb-6 px-4 py-3 rounded-lg ring-1 text-sm",
                                message.type === "error" && "bg-red-500/10 ring-red-500/30 text-red-300",
                                message.type === "success" && "bg-green-500/10 ring-green-500/30 text-green-300",
                                message.type === "warning" && "bg-yellow-500/10 ring-yellow-500/30 text-yellow-300",
                                message.type === "info" && "bg-accent-500/10 ring-accent-500/30 text-accent-300"
                            )}
                            dangerouslySetInnerHTML={{ __html: kcSanitize(message.summary) }}
                        />
                    )}

                    {/* Form content */}
                    {children}

                    {/* Try another way */}
                    {auth !== undefined && auth.showTryAnotherWayLink && (
                        <form id="kc-select-try-another-way-form" action={url.loginAction} method="post" className="mt-4 text-center">
                            <input type="hidden" name="tryAnotherWay" value="on" />
                            <a
                                href="#"
                                id="try-another-way"
                                onClick={event => {
                                    (document.forms as never as Record<string, HTMLFormElement>)["kc-select-try-another-way-form"].requestSubmit();
                                    event.preventDefault();
                                    return false;
                                }}
                                className="text-xs text-accent-500 hover:text-accent-400 transition-colors"
                            >
                                {msg("doTryAnotherWay")}
                            </a>
                        </form>
                    )}

                    {/* Social providers */}
                    {socialProvidersNode}

                    {/* Info / register link */}
                    {displayInfo && (
                        <div id="kc-info" className="mt-6">
                            <div id="kc-info-wrapper" className="text-center text-sm text-white/40">
                                {infoNode}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
