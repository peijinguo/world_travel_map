import { createHashRouter } from "react-router-dom";
import Home from "../views/frontend/Home";
import GlobeHome from "../views/frontend/GlobeHome";
import CountryHome from "../views/frontend/CountryHome";
import ResortDetail from "../views/frontend/ResortDetail";
import FrontendLayout from "../layout/FrontendLayout";
import Planner from "../views/frontend/Planner";
import Hotel from "../views/frontend/Hotel";
import Wishlist from "../views/frontend/Wishlist";
import Prep from "../views/frontend/Prep";

export const router = createHashRouter([
    {
        path: '/',
        element: <FrontendLayout />,
        children: [
            {
                index: true,
                element: <GlobeHome />,
            },
            {
                path: 'japan',
                element: <Home />,
            },
            {
                path: 'resorts/:townId/:resortIndex',
                element: <ResortDetail />,
            },
            {
                path: 'planner',
                element: <Planner />,
            },
            {
                path: 'hotel',
                element: <Hotel />
            },
            {
                path: 'prep',
                element: <Prep />
            },
            {
                path: 'wishlist',
                element: <Wishlist />
            },
            // Every other country: its map, then the same four pages, each
            // with that country's own copy of the trip (see services/syncCode).
            {
                path: 'c/:country',
                element: <CountryHome />,
            },
            { path: 'c/:country/prep', element: <Prep /> },
            { path: 'c/:country/planner', element: <Planner /> },
            { path: 'c/:country/hotel', element: <Hotel /> },
            { path: 'c/:country/wishlist', element: <Wishlist /> },

        ]
    }
])
