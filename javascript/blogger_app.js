/**
 *
 * Description   :   项目初始化 js
 * Project Name  :   Blogger_FrontEnd
 * Author        :   FieLong Sun
 * Date          :   2016-09-08  07:21
 */

(function (angular) {
    'use strict'

    angular.module('blogger_model', [
        'ui.router',
        'angular-confirm',
        'toaster',
        'toasterModule'
    ])
        .run(function ($rootScope, $templateCache, $confirmModalDefaults) {
            //监听页面跳转时间,删除ui-route 的模板缓存
            var stateChangeSuccess = $rootScope.$on('$stateChangeSuccess', stateChangeSuccess);

            function stateChangeSuccess($rootScope) {
                $templateCache.removeAll();
            }

            //配置 angular-confirm 弹出框的信息
            $confirmModalDefaults.templateUrl = 'view/tpls/confirmTpl.html';
            $confirmModalDefaults.defaultLabels.title = '请确认';
            $confirmModalDefaults.defaultLabels.ok = '确定';
            $confirmModalDefaults.defaultLabels.cancel = '取消';
        })

        .controller('blogger_controller', function ($scope, $http, toasterPOP) {
            $scope.articleTitle = "";
            $scope.searchText = "";
            $scope.recentUpdate = [];
            $scope.searchResult = {};
            $scope.showSearchList = false;
            $scope.bloggerName = "蓝田";

            $scope.loveNumber = 0;
            $scope.viewNumber = 0;

            $scope.initSearchList = function (event, results) {
                $scope.searchResult = results;
                $scope.showSearchList = true;
            }

            $scope.openNode = function (nodeId) {
                $('#tree').treeview('collapseAll', {silent: true});
                $('#tree').treeview('clearSearch');
                $('#tree').treeview('revealNode', [nodeId, {silent: false}]);
                $('#tree').treeview('toggleNodeSelected', [nodeId, {silent: false}]);
                $scope.showSearchList = false;
                $scope.searchText = "";
            }
            $scope.clearSearch = function () {
                $('#tree').treeview('clearSearch');
                $scope.searchText = "";
                $scope.searchResult = {};
                $scope.showSearchList = false;
            }

            $scope.initArticleInfo = function (id) {
                var params = {
                    id: id
                }
                $http({
                    method: 'GET',
                    url: HOST + '/articleInfo/getArticleInfo',
                    params: params,
                }).success(function (sysMsg) {
                    try {
                        $scope.loveNumber = sysMsg.data.loveNumber;
                        $scope.viewNumber = sysMsg.data.viewNumber;
                    } catch (e) {
                        $scope.loveNumber = 0;
                        $scope.viewNumber = 0;
                    }
                });
            }

            $scope.initLoadArticle = function () {
                $http({
                    method: 'GET',
                    url: HOST + '/fileInfo/getInitLoadArticle'
                }).success(function (sysMsg) {
                    try {
                        $scope.articleTitle = sysMsg.data.fileName;
                        $scope.initContent(sysMsg.data.id);
                        $scope.initArticleInfo(sysMsg.data.id);
                    } catch (e) {
                        toasterPOP.pop('error', '获取数据失败!');
                        console.log(e);
                    }
                });
            }

            $scope.onNodeSelected = function (event, data) {
                if (!data.hasChild) {
                    $scope.articleTitle = data.fileName;
                    $scope.initContent(data.id);
                    $scope.initArticleInfo(data.id);
                } else {
                    if (!data.state.expanded) {
                        $('#tree').treeview('expandNode', [data.nodeId]);
                    } else {
                        $('#tree').treeview('collapseNode', [data.nodeId]);
                    }
                }
            }

            $scope.recentUpdateClick = function (id, filename) {
                $scope.articleTitle = filename;
                $scope.initContent(id);
                $scope.initArticleInfo(id);
            }

            $scope.initContent = function (id) {
                $http({
                    method: 'GET',
                    url: HOST + '/fileInfo/getContentByFilePath',
                    params: {
                        id: id,
                        type: "text"
                    }
                }).success(function (sysMsg) {
                    try {
                        $("#bloggerContext").empty();
                        marked.setOptions({
                            highlight: function (code) {
                                return hljs.highlightAuto(code).value;
                            }
                        });
                        $("#bloggerContext").append(marked(sysMsg.data));
                    } catch (e) {
                        toasterPOP.pop('error', '获取数据失败!');
                    }
                });
            }
            
            $scope.initRecentUpdate = function () {
                $http({
                    method: 'GET',
                    url: HOST + '/fileInfo/getFileListSortByUpdateDate'
                }).success(function (sysMsg) {
                    try {
                        $scope.recentUpdate = sysMsg.data;
                    } catch (e) {
                        toasterPOP.pop('error', '获取数据失败!');
                    }
                });
            }

            $scope.initFileTree = function () {
                $http({
                    method: 'GET',
                    url: HOST + '/fileInfo/getFileTree'
                }).success(function (sysMsg) {
                    if (sysMsg.success) {
                        $scope.treeNodes = sysMsg.data;
                        //初始化左侧树结构
                        $('#tree').treeview({
                            data: $scope.treeNodes[0].nodes,
                            levels: 1,      //展开的层级
                            width: '98%',
                            onNodeSelected: $scope.onNodeSelected,
                            onSearchComplete: $scope.initSearchList
                        });
                    } else {
                        toasterPOP.pop('success', sysMsg.message);
                    }
                    $scope.initLoadArticle();
                }).error(function (sysMsg) {
                    toasterPOP.pop('error', '系统错误!');
                });
            };


            //搜索
            $scope.search = function () {
                $('#tree').treeview('search', [$scope.searchText, {
                    ignoreCase: true,
                    exactMatch: false,
                    revealResults: true,
                }]);
            }

            $scope.initFileTree();
            $scope.initRecentUpdate();
        })

        .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

                /* 通过$stateProvider的state()函数来进行路由定义 */
                $stateProvider
                    .state('/',
                        {
                            url: '/',
                            templateUrl: '../html/blogger.html'
                        }
                    );
            }]
        );
})(window.angular);