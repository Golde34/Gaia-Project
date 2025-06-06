import { useDispatch, useSelector } from "react-redux"
import { gaiaSignin } from "../../api/store/actions/auth_service/auth.actions";
import { useEffect, useMemo, useRef } from "react";
import { Navigate } from "react-router-dom"

const GaiaAutoSignin = () => {
    const dispatch = useDispatch();

    const gaia = useSelector((state) => state.gaiaSignin)
    const { gaiaInfo, loading, error } = gaia;
    const obj = useMemo(() => {
        if (gaiaInfo !== null && gaiaInfo !== undefined && gaiaInfo !== '') {
            return gaiaInfo;
        }
    })
    const didGaiaAuthenticateRef = useRef();

    useEffect(() => {
        if (didGaiaAuthenticateRef.current) return;
        dispatch(gaiaSignin());
        didGaiaAuthenticateRef.current = true;
    }, [dispatch]);

    return (
        <div>
            {loading ? (
                <div>Loading...</div>
            ) : error ? (
                <div><Navigate to='/signin' /></div>
            ) : gaiaInfo ? (
                <div><Navigate to='/dashboard' /></div>
            ) : (
                <></>
            )
            }
        </div >
    )
}

export default GaiaAutoSignin;