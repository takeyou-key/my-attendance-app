import React, { useState, useRef } from "react";
import Joyride, { ACTIONS, EVENTS, STATUS } from "react-joyride";

/**
 * チュートリアル表示コンポーネント
 * react-joyrideを使用してステップガイドを表示
 */
export default function Tutorial() {
    const [run, setRun] = useState(false);
    const [stepIndex, setStepIndex] = useState(0);
    const joyrideRef = useRef(null);
    const [steps, setSteps] = useState([
        {
            target: ".step1",
            title:"",
            content: "①変更したい日にちの項目欄をダブルクリックして下さい。※出勤時刻・退勤時刻・休憩時間のみ修正可能",
            placement: "top",
            disableBeacon: true
        },
        {
            target: ".step2",
            content: "②変更したい時間を入力して下さい。",
            placement: "top",
        },
        {
            target: ".step3",
            content: "③申請ボタンを押して下さい。",
            placement: "top",
            hideBackButton: true,
        },
        {
            target: ".step4",
            content: "④コメントを入力します（任意）",
            placement: "top",
            waitFor: () => document.querySelector('.step4') !== null,
        },
        {
            target: ".step5",
            content: "⑤申請するボタンを押して申請完了です",
            placement: "top",
            waitFor: () => document.querySelector('.step5') !== null,
        }
    ]);

    const handleClickStart = () => {
        setRun(true);
    };

    const handleJoyrideCallback = (data) => {
        const { action, index, status, type } = data;
        
        // ツアーが開始されたらALERTを無効化
        if (type === EVENTS.TOUR_START) {
            window.originalAlert = window.alert;
            window.alert = () => {};
        }
        
        // step3で申請ボタンが押された後の処理
        if (index === 2 && action === ACTIONS.NEXT) {
            // モーダルが開くまで少し待ってからstep4に進む
            setTimeout(() => {
                if (joyrideRef.current) {
                    joyrideRef.current.next();
                }
            }, 500);
        }
        
        // ツアーが終了したらALERTを元に戻す
        if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
            if (window.originalAlert) {
                window.alert = window.originalAlert;
                delete window.originalAlert;
            }
            setRun(false);
            setStepIndex(0);
        }
    };

    return (
        <div>
            <Joyride
                ref={joyrideRef}
                steps={steps}
                run={run} // ← これが true になるとツアーが開始
                stepIndex={stepIndex}
                continuous={true} // 「次へ」ボタンを常に表示
                showProgress={true} // ステップ数を表示
                showSkipButton={true} // スキップボタンを表示
                callback={handleJoyrideCallback}
                spotlightClicks={true} // ターゲット要素をクリック可能にする
                disableOverlayClose={false} // オーバーレイクリックで閉じる
                styles={{
                    overlay: {
                        zIndex: 9999 // モーダルより高いz-index
                    },
                    tooltip: {
                        zIndex: 10000
                    }
                }}
            />

            <button onClick={handleClickStart} style={{ border: '1px solid #000', borderRadius: '10px', padding: '10px', cursor: 'pointer', marginBottom: '10px' }}>申請方法を確認する</button>
        </div>
    );
}
