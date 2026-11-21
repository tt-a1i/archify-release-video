import { createContext, useContext } from 'react';

export type PromoLocale = 'zh' | 'en';

export const PromoLocaleContext = createContext<PromoLocale>('zh');

export const useLocale = (): PromoLocale => useContext(PromoLocaleContext);

const chooseChinese = (zh: string, _en: string) => zh;
const chooseEnglish = (_zh: string, en: string) => en;

export const useT = () => useLocale() === 'en' ? chooseEnglish : chooseChinese;
