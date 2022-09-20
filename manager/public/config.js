var BASE = {
    /**
     * @description api请求基础路径
     */
    API_DEV: {
      common: "http://127.0.0.1:8890",
      buyer: "http://8.136.107.94:8888",
      seller: "http://8.136.107.94:8889",
      manager: "http://127.0.0.1:8887",
    },
    API_PROD: {
      common: "http://8.136.107.94:8890",
      buyer: "http://8.136.107.94:8888",
      seller: "http://8.136.107.94:8889",
      manager: "http://8.136.107.94:8887",
    },
    /**
     * @description // 跳转买家端地址 pc端
     */
    PC_URL: "https://pc-b2b2c.pickmall.cn",
    /**
     * @description  // 跳转买家端地址 wap端
     */
    WAP_URL: "https://m-b2b2c.pickmall.cn",
    /**
     *  @description api请求基础路径前缀
     */
    PREFIX: "/manager"
  };
