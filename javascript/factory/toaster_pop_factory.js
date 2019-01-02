/**
 *
 * Description   :   封裝 toaster插件
 * Project Name  :   XiaoTian
 * Author        :   FieLong Sun
 * Date          :   2016-05-17  22:29
 */

var toaster_pop = angular.module('toasterModule', ['toaster']);

toaster_pop.factory('toasterPOP', function(toaster){

    var toasterPOP = {
        pop: function(type, message) {
            toaster.pop({
                type: type,
                title: '',
                body: message,
                showCloseButton: true,
            });
        }
    };

    return toasterPOP;

});