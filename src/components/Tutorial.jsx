import React, { useState } from "react";
import { FaQuestionCircle } from 'react-icons/fa';

/**
 * シンプルなツアーコンポーネント
 */
export default function Tutorial() {
    const [currentStep, setCurrentStep] = useState(0);
    const [isActive, setIsActive] = useState(false);

    const steps = [
        {
            target: ".step1",
            content: (
                <>
                    ①修正したい項目をダブルクリックして時間を入力します。<br />
                    ※出勤・退勤・休憩時間の修正が可能です。
                </>
            ),
            position: "bottom"
        },
        {
            target: ".step3",
            content: (<>②申請ボタンを押してコメントを入力し、申請するボタンを押して完了です。</>),
            position: "bottom"
        }
    ];

    const startTour = () => {
        setIsActive(true);
        setCurrentStep(0);
        highlightElement(steps[0].target);
    };

    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            const nextStepIndex = currentStep + 1;
            setCurrentStep(nextStepIndex);
            highlightElement(steps[nextStepIndex].target);
        } else {
            endTour();
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            const prevStepIndex = currentStep - 1;
            setCurrentStep(prevStepIndex);
            highlightElement(steps[prevStepIndex].target);
        }
    };

    const endTour = () => {
        setIsActive(false);
        setCurrentStep(0);
        removeHighlight();
    };

    const highlightElement = (selector) => {
        removeHighlight();
        const element = document.querySelector(selector);
        if (element) {
            // テーブルセルの場合は特別な処理
            if (element.tagName === 'TD') {
                element.style.position = 'relative';
                element.style.zIndex = '1000';
                element.style.outline = '4px solid #ff0000';
                element.style.outlineOffset = '2px';
                element.style.backgroundColor = 'rgba(9, 83, 243, 0.1)';
                element.style.borderRadius = '4px';
            } else {
                // 通常の要素（ボタンなど）
                element.style.position = 'relative';
                element.style.zIndex = '1000';
                element.style.boxShadow = '0 0 0 4px #ff0000';
                element.style.borderRadius = '8px';
                element.style.backgroundColor = 'rgba(9, 83, 243, 0.1)';
            }
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    const removeHighlight = () => {
        // box-shadowを持つ要素をクリア
        document.querySelectorAll('[style*="box-shadow"]').forEach(el => {
            el.style.position = '';
            el.style.zIndex = '';
            el.style.boxShadow = '';
            el.style.borderRadius = '';
            el.style.backgroundColor = '';
        });
        
        // outlineを持つ要素をクリア
        document.querySelectorAll('[style*="outline"]').forEach(el => {
            el.style.position = '';
            el.style.zIndex = '';
            el.style.outline = '';
            el.style.outlineOffset = '';
            el.style.backgroundColor = '';
            el.style.borderRadius = '';
        });
    };

    if (!isActive) {
        return (
            <button
                onClick={startTour}
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium py-1 px-2 rounded text-sm border border-gray-300"
            >
                <span className="flex items-center gap-1">
                    <FaQuestionCircle className="w-3 h-3" />
                    申請ガイド
                </span>
            </button>
        );
    }

    const currentStepData = steps[currentStep];
    const targetElement = document.querySelector(currentStepData.target);

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-[9998]" onClick={endTour} />

            {targetElement && (
                <div
                    className="fixed z-[9999] bg-white rounded-lg shadow-xl p-4 md:p-6"
                    style={{
                        top: currentStepData.position === 'top' 
                            ? `${Math.max(10, targetElement.offsetTop - 20)}px`
                            : `${Math.min(targetElement.offsetTop + targetElement.offsetHeight + 20, window.innerHeight - 200)}px`,
                        left: `${Math.max(10, Math.min(targetElement.offsetLeft, window.innerWidth - 320))}px`,
                        width: '300px',
                        maxWidth: 'calc(100vw - 20px)',
                        transform: currentStepData.position === 'top' ? 'translateY(-100%)' : 'translateY(0)'
                    }}
                >
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-sm md:text-base">ステップ {currentStep + 1}/2</h3>
                        <button onClick={endTour} className="text-gray-400 hover:text-gray-600 text-lg">×</button>
                    </div>

                    <p className="text-gray-700 mb-4 text-sm md:text-base leading-relaxed">{currentStepData.content}</p>

                    <div className="flex justify-between gap-2">
                        <button
                            onClick={prevStep}
                            disabled={currentStep === 0}
                            className="px-3 py-2 md:px-4 rounded bg-gray-200 text-gray-700 disabled:opacity-50 text-sm md:text-base flex-1"
                        >
                            戻る
                        </button>
                        <button
                            onClick={nextStep}
                            className="px-3 py-2 md:px-4 rounded bg-blue-500 text-white text-sm md:text-base flex-1"
                        >
                            {currentStep === steps.length - 1 ? '完了' : '次へ'}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}