import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from "@azure/msal-react";
import Header from "./Header";
import "../cssComponents/LoginAdmin.css";
import LoginButton from "./LoginButton";

const LoginAdmin = () => {
    const { accounts, instance } = useMsal();
    const navigate = useNavigate();
    const hasInstance = Boolean(instance);

    useEffect(() => {
        if (!hasInstance) {
            return;
        }

        const accountList = Array.isArray(accounts) ? accounts : [];
        const account = instance.getActiveAccount() ?? accountList[0] ?? null;
        const roles = Array.isArray(account?.idTokenClaims?.roles)
            ? account.idTokenClaims.roles
            : [];

        if (roles.includes("Administrador")) {
            navigate("/dashboard", { replace: true });
        }
    }, [accounts, hasInstance, instance, navigate]);

    if (!hasInstance) {
        return null;
    }

    return (
        <>
            <Header />
            <div className="containerFather">
                <Link className="ButtonAccept" to={"/"}>
                    Home
                </Link>
                <div className="container">
                    <h2 className="text-initial">Iniciar sesión como Administrador</h2>
                    <UnauthenticatedTemplate>
                        <div className="microsoft-signin">
                            <p>Inicia sesión con tu cuenta Microsoft:</p>
                            <LoginButton text="Iniciar sesión con Microsoft" />
                        </div>
                    </UnauthenticatedTemplate>
                    <AuthenticatedTemplate>
                        <div className="microsoft-session">
                            <p>Validando tu sesión...</p>
                        </div>
                    </AuthenticatedTemplate>
                </div>
            </div>
        </>
    );
};

export default LoginAdmin;
