import { useEffect } from "react";
import useAxiosPrivate from "./useAxiosPrivate";
import { useSearchParams } from "react-router-dom";

const useFetchCardDetail = ({ stateHooks }) => {
    const axiosPrivate = useAxiosPrivate();

    const { setCardDetailAbortController, setOpenCardDetail, setOpenedCard } =
        stateHooks;
    const [searchParams, _setSearchParams] = useSearchParams();

    useEffect(() => {
        const cardId = searchParams.get("card");
        if (!cardId) {
            return;
        }

        const getCardData = async () => {
            try {
                const controller = new AbortController();
                setCardDetailAbortController(controller);
                setOpenCardDetail(true);
                setOpenedCard(undefined);
                const response = await axiosPrivate.get(`/cards/${cardId}`, {
                    signal: controller.signal,
                });
                const { card } = response.data;
                setOpenedCard(card);

                // Set document title as card title
                document.title = `[card] ${card.title}`;
            } catch (err) {
                const errMsg =
                    err?.response?.data?.msg || "failed to get card data";
                setOpenedCard({ failedToLoad: true, errMsg });
            }
        };

        getCardData();
    }, [searchParams]);
};

export default useFetchCardDetail;
