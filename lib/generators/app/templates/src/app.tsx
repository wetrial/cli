import React from 'react';
import { history } from 'umi';
import { BasicLayoutProps } from '@ant-design/pro-layout';
import { ConfigProvider, notification } from 'antd';
import validateMessages from '@wetrial/core/es/validation';
import { UseRequestProvider } from '@ahooksjs/use-request';
// import { omit } from 'lodash';
// import { UnAuthorizedException } from '@wetrial/core/es/exception';
import { initWetrialCore } from '@wetrial/core';
// import { patchRouteBase } from '@wetrial/core/es/route-helper';
import { initHooks } from '@wetrial/hooks';
import { initComponent } from '@wetrial/component';
import defaultSettings from '@config/defaultSettings';
import { getCurrentUser } from '@/services/account';
import { request as requestMethod } from '@/utils/request';
import { getToken } from '@/utils/authority'; // , clearPidAndOid, setOid, getOid
import { IGlobalProps } from '@/services/global.d';
import RightContent from '@/components/RightContent';
import logo from './assets/logo.png';
import zhCN from 'antd/es/locale/zh_CN';
import moment from 'moment';
import 'moment/locale/zh-cn';

moment.locale('zh-cn');

(function init() {
  // 初始化核心库配置信息
  initWetrialCore({
    RSAKey:
      'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC5HI3rQq9BKcruxYfqgnkhyuI+9CGf1jYsyzWYpdw/3Cv9TX4u5w2GjcYoxzBY5s6ZcXbb4oGoLt9rn93g7sKT01tyUO/iQdYiOTvPsFiqcInMVHhaazBy5nH50owObGs+PRubc8bP+a+DT3vV8+l7TEd/H9pdwok/r7GlIIe5uQIDAQAB',
    // getGlobalHeader: () => {
    //   const headers = {};
    //   const oid = getOid();
    //   if (oid) {
    //     headers['oid'] = oid;
    //   }
    //   return headers;
    // },
  });

  // 初始化组件配置信息
  initComponent({
    iconFontUrl: defaultSettings.iconfontUrl,
  });

  // 初始化hooks配置信息，根据需要
  initHooks({
    formTableResultFormat: (data) => {
      return {
        total: data.totalCount,
        list: data.items,
      };
    },
  });
})();

export function render(oldRender) {
  // const {
  //   location: { pathname },
  // } = history;

  // // 解析出base参数
  // clearPidAndOid();
  // const match = /^\/([^/]+)\//gi.exec(pathname);
  // if (match && match[1]) {
  //   setOid(match[1]);
  //   initWetrialCore({
  //     routeProfix: `/${match[1]}`,
  //   });
  // }

  oldRender();
}

// export function patchRoutes({ routes }) {
//   patchRouteBase(routes);
// }

export async function getInitialState(): Promise<IGlobalProps> {
  const token = getToken();
  const {
    location: { pathname },
  } = history;
  const loginPathName = '/membership/login';

  // 未登录的情况
  if (!token) {
    if (pathname !== loginPathName) {
      history.push({
        pathname: loginPathName,
        query: {
          redirect: pathname,
        },
      });
    }
    return {
      settings: defaultSettings,
    };
  } else {
    const currentUser = await getCurrentUser();
    return {
      currentUser,
      settings: defaultSettings,
    };
  }
}

const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  405: '请求方法不被允许。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};

export function rootContainer(container) {
  return React.createElement(
    ConfigProvider,
    {
      form: { validateMessages },
      input: {
        autoComplete: 'off',
      },
      locale: zhCN,
    },
    React.createElement(
      UseRequestProvider,
      {
        value: {
          requestMethod: (param) => requestMethod(param),
          onError: (response) => {
            if (response && response.status) {
              const { status, statusText, data: { error } = { error: {} } } = response;
              const { message } = error;
              const errorText = message || codeMessage[status] || statusText;

              notification.error({
                message: `请求错误 ${status}`,
                description: errorText,
              });
            }

            if (!response) {
              notification.error({
                description: '您的网络发生异常，无法连接服务器',
                message: '网络异常',
              });
            }
            throw response;
          },
        },
      },
      container,
    ),
  );
}

export const layout = ({ initialState }: { initialState }): BasicLayoutProps => {
  return {
    navTheme: 'light',
    logo,
    iconfontUrl: defaultSettings.iconfontUrl,
    rightContentRender: () => <RightContent />,
    // footerRender: () => <DefaultFooter links={[]} copyright="2020 湖南微试云技术团队" />,
    ...initialState?.settings,
  };
};
