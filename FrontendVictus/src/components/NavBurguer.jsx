import { Link } from 'react-router-dom';
import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from '@azure/msal-react';
import '../cssComponents/NavBurguer.css'
import Logo from '../resources/pictures/logoVictus.png';
import LoginButton from './LoginButton';
import LogoutButton from './LogoutButton';

function NavBurguer() {
    const { accounts, instance } = useMsal();
    if (!instance) {
        return null;
    }
    const accountList = Array.isArray(accounts) ? accounts : [];
    const activeAccount = instance.getActiveAccount() ?? accountList[0] ?? null;

    return (
        <>
            <div className="header">
                <nav className="navbar">
                    <img src={Logo} alt="Logo" />
                    <div className="name1">
                        <strong>Victus</strong>
                        <span className="name2">Viviendas</span>
                    </div>

                    <label className="labe_hamburguesa" htmlFor="menu_hamburguesa">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="35"
                            height="35"
                            fill="currentColor"
                            className="list_icon"
                            viewBox="0 0 16 16"
                        >
                            <path
                                fillRule="evenodd"
                                d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"
                            />
                        </svg>
                    </label>

                    <input className="menu_hamburguesa" type="checkbox" id="menu_hamburguesa" />

                    <ul className="ul_links">
                        <li className="li_links">
                            <Link to={"/loginAdmin"} className="link">
                            <i className="icon_admin"></i>
                            <p>Administrador</p>
                            </Link>
                            {/* <Link to={"/prueba"} className="link"> */}
                                {/* <i className="icon_admin"></i> */}
                                {/* <p>Administrador</p> */}
                            {/* </Link> */}
                        </li>
                        <li className="li_links">
                            <Link to={"/Loading"} className="link">
                                <i className="icon_porteria"></i>
                                <p>Portería</p>
                            </Link>
                        </li>
                        <li className="li_links">
                            <Link href="#" className="link">
                                <i className="icon_resident"></i>
                                <p>Residente</p>
                            </Link>
                        </li>
                        <li className="li_links auth_access">
                            <UnauthenticatedTemplate>
                                <LoginButton />
                            </UnauthenticatedTemplate>
                            <AuthenticatedTemplate>
                                <div className="auth-user">
                                    <span>
                                        {activeAccount?.name ?? activeAccount?.username ?? "Usuario"}
                                    </span>
                                    <LogoutButton className="ButtonAccept" />
                                </div>
                            </AuthenticatedTemplate>
                        </li>
                    </ul>
                </nav>
            </div>
        </>
    )
}

export default NavBurguer;
