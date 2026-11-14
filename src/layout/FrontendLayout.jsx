import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../component/Header"
import BackToTop from "../component/BackToTop"
import { useAuth } from "../context/AuthContext";
import { countryFromHash } from "../services/syncCode";

function FrontendLayout() {
    // Tell the trip data which country's pages are open (#/c/<id>/…, or Japan).
    const { pathname } = useLocation();
    const { setCountry } = useAuth();
    useEffect(() => {
        setCountry(countryFromHash(`#${pathname}`));
    }, [pathname, setCountry]);

    return (
        <>
            <Header />
            <main>
                <Outlet />
            </main>
            <BackToTop />
        </>
    )
}

export default FrontendLayout;
