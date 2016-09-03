"use strict";

var moment = require("moment"),
    _ = require("lodash"),
    downsize = require("downsize"),
    downzero = require("./downzero"),
    stringUtils = require("mout/string");

module.exports = function (rootPath) {

    function getUrl(slug) {
        if(slug.split(".")[slug.split(".").length -1 ] == "timeline_capabilities_features")
            console.log(slug)


        return slug.split(".")[slug.split(".").length -1];
    }

    return {
        batch: [rootPath + "/src/templates/partials"],
        checkContent: function (fileData) {
            var excerpt = stringUtils.stripHtmlTags(fileData.body);
            excerpt = excerpt.replace(/(\r\n|\n|\r)+/gm, " ");
            var title = downsize(excerpt, { words: 10 });

            if (!fileData.title) {
                fileData.title = title;
            }

            if (!fileData.slug) {
                fileData.slug = stringUtils.slugify(fileData.title, "-");
            }

            if (!fileData.template && !fileData.date) {
                fileData.template = "page.hbs";
            } else if (fileData.date && !fileData.template) {
                fileData.template = "post.hbs";
            }

            return fileData;
        },

        helpers: {
            
            
            
            mobileview: function(slug,pages) {

                var mainMenus = [];
                var subMenuLevel1 = [];
                var subMenuLevel2 = [];


                pages.forEach(function (page) {
                    var pageSlug = slug.split('.');
                    if (!page.slug) return;
                    var route = page.slug.toString().split(".");
                    if (route.length === 1) {
                        mainMenus.push(page);
                    } else if(route.length == 2 && pageSlug.length > 1){
                        // if (route[0] === pageSlug[0])
                            subMenuLevel1.push(page);
                    }else if(pageSlug.length > 2){
                        if (route[0] === pageSlug[0] && route[1] === pageSlug[1])
                            subMenuLevel2.push(page);
                    }
                });


                function getLevel2(menu) {
                    var subs = [];
                    menu.sort(function (a,b) {
                        return a.meta.order - b.meta.order;

                    })

                    menu.forEach(function (sub) {
                        subs.push('<li class="panel"><a href="/' + getUrl(sub.slug) + '/">' + sub.title + '</a></li>');
                    });

                    if (subs.length){
                        return '<ul class="list-unstyled">' +  subs.join("") + '</ul>';
                    }else{
                        return "";
                    }
                }

                function getLevel1(menu) {
                    var subs = [];
                    menu.sort(function (a,b) {
                        return a.meta.order - b.meta.order;

                    })

                    menu.forEach(function (sub) {
                        var _submenus = subMenuLevel2.filter(function (obj) {
                            return obj.slug.indexOf(sub.slug) > -1;
                        });
                        subs.push('<li class="panel"><a href="/' + getUrl(sub.slug) + '/">' + sub.title + '</a>' +  getLevel2(_submenus) +'</li>');
                    });

                    if (subs.length){
                        return '<ul class="list-unstyled">' +  subs.join("") + '</ul>'
                    }else{
                        return "";
                    }
                }

                function getMain(subMenus) {
                    var subs = [];

                    subMenus.sort(function (a,b) {
                        return a.meta.order - b.meta.order;

                    })

                    subMenus.forEach(function (sub) {
                        var _submenus = subMenuLevel1.filter(function (obj) {
                            if (!obj.slug || !sub.slug) return false;
                            return obj.slug.indexOf(sub.slug) > -1;
                        });
                        subs.push('<li class="overpanel"><a href="/' + sub.url + '">' + sub.title + '</a>' +  getLevel1(_submenus) +'</li>');
                    });
                    return '<ul>' + subs.join("") + '</ul>';

                }


                return  getMain(mainMenus) ;
            },
            

            nextpage: function (slug, pages) {

                var mainMenus = [];
                var subMenuLevel1 = [];
                var subMenuLevel2 = [];
                var list = [];
                
                pages.forEach(function (page) {
                    var pageSlug = slug.split('.');
                    if (!page.slug) return;
                    var route = page.slug.toString().split(".");
                    if (route.length === 1) {
                        mainMenus.push(page);
                    } else if(route.length == 2 && pageSlug.length > 1){
                        subMenuLevel1.push(page);
                    }else if(pageSlug.length > 2){
                        subMenuLevel2.push(page);
                    }
                });


                function getLevel2(menu) {
                    menu.sort(function (a,b) {
                        return a.meta.order - b.meta.order;

                    })
                    
                    menu.forEach(function (sub) {
                       list.push(sub);
                    });
                    
                }

                function getLevel1(menu) {
                    
                    menu.sort(function (a,b) {
                        return a.meta.order - b.meta.order;

                    })

                    menu.forEach(function (sub) {
                        list.push(sub);
                        var _submenus = subMenuLevel2.filter(function (obj) {
                            return obj.slug.indexOf(sub.slug) > -1;
                        });
                        getLevel2(_submenus);
                    });
                    
                }

                function getMain(subMenus) {
                    
                    subMenus.sort(function (a,b) {
                        return a.meta.order - b.meta.order;
                    })

                    subMenus.forEach(function (sub) {
                        list.push(sub);
                        var _submenus = subMenuLevel1.filter(function (obj) {
                            if (!obj.slug || !sub.slug) return false;
                            return obj.slug.indexOf(sub.slug) > -1;
                        });
                        getLevel1(_submenus)
                    });

                }
                var index;
                getMain(mainMenus);
                list.forEach(function (page,i) {
                    if(page.slug == slug){
                        index = i;
                    }
                })
                if(index == list.length-1){
                    return null;
                }
                else {
                    var next = list[index + 1];
                    return '<a href="/'+getUrl(next.slug)+'"> <span>Next</span>' + next.title + '<div class="nxtarrow"></div> </a>';


                }
                
             },

            
            breadcrumb:function(slug, pages){
                var arrow = '<div class="arrow"></div>';
                var route = slug.split('.');
                var parts = [];

                route.forEach(function (r, index) {
                    pages.forEach(function (p) {
                        if (p.slug.split('.').length - 1 === index && p.slug.split('.')[index] == r){
                            parts.push(p);
                        }

                    });
                });

                var result = [];
                parts.forEach(function (part) {
                    result.push("<a href='/" + getUrl(part.slug) + "' > " + part.title + "</a>")
                });

                return result.join(arrow);
            },
            
            navigation: function (slug, pages) {

                var mainMenus = [];
                var subMenuLevel1 = [];
                var subMenuLevel2 = [];


                pages.forEach(function (page) {
                    var pageSlug = slug.split('.');
                    if (!page.slug) return;
                    var route = page.slug.toString().split(".");
                    if (route.length === 1) {
                        mainMenus.push(page);
                    } else if(route.length == 2 && pageSlug.length > 1){
                        if (route[0] === pageSlug[0])
                            subMenuLevel1.push(page);
                    }else if(pageSlug.length > 2){
                        if (route[0] === pageSlug[0] && route[1] === pageSlug[1])
                            subMenuLevel2.push(page);
                    }
                });


                function getLevel2(menu) {
                    var subs = [];
                    menu.sort(function (a,b) {
                        return a.meta.order - b.meta.order;

                    })

                    menu.forEach(function (sub) {
                        subs.push('<li><a href="/' + getUrl(sub.slug) + '/">' + sub.title + '</a></li>');
                    });

                    if (subs.length){
                        return '<ul>' +  subs.join("") + '</ul>';
                    }else{
                        return "";
                    }
                }

                function getLevel1(menu) {
                    var subs = [];
                    menu.sort(function (a,b) {
                        return a.meta.order - b.meta.order;

                    })

                    menu.forEach(function (sub) {
                        var _submenus = subMenuLevel2.filter(function (obj) {
                            return obj.slug.indexOf(sub.slug) > -1;
                        });
                        subs.push('<li><a href="/' + getUrl(sub.slug) + '/">' + sub.title + '</a>' +  getLevel2(_submenus) +'</li>');
                    });

                    if (subs.length){
                        return '<ul>' +  subs.join("") + '</ul>'
                    }else{
                        return "";
                    }
                }
                
                function getMain(subMenus) {
                    var subs = [];

                    subMenus.sort(function (a,b) {
                        return a.meta.order - b.meta.order;
                        
                    })

                    subMenus.forEach(function (sub) {
                        var _submenus = subMenuLevel1.filter(function (obj) {
                            if (!obj.slug || !sub.slug) return false;
                            return obj.slug.indexOf(sub.slug) > -1;
                        });
                        subs.push('<li><a href="/' + sub.url + '">' + sub.title + '</a>' +  getLevel1(_submenus) +'</li>');
                    });
                    return '<ul>' + subs.join("") + '</ul>';
                    
                }


                return  getMain(mainMenus) ;
                
                
            },
            date: function (context, options) {
                if (!options && context.hasOwnProperty("hash")) {
                    options = context;
                    context = undefined;

                    // set to published_at by default, if it"s available
                    // otherwise, this will print the current date
                    if (this.date) {
                        context = this.date;
                    }
                }

                // ensure that context is undefined, not null, as that can cause errors
                context = context === null ? undefined : context;

                var format = options.hash.format || "MMM Do, YYYY";
                var date = moment(context, "YYYY-MM-DD").format(format);

                return date;
            },
            excerpt: function (options) {
                var truncateOptions = (options || {}).hash || {},
                    excerpt;

                truncateOptions = _.pick(truncateOptions, ["words", "characters"]);
                _.keys(truncateOptions).map(function (key) {
                    truncateOptions[key] = parseInt(truncateOptions[key], 10);
                });

                excerpt = stringUtils.stripHtmlTags(this.description);
                excerpt = excerpt.replace(/(\r\n|\n|\r)+/gm, " ");

                if (!truncateOptions.words && !truncateOptions.characters) {
                    truncateOptions.words = 50;
                }

                return downsize(excerpt, truncateOptions);
            },
            content: function (options) {
                var truncateOptions = (options || {}).hash || {};
                truncateOptions = _.pick(truncateOptions, ["words", "characters"]);
                _.keys(truncateOptions).map(function (key) {
                    truncateOptions[key] = parseInt(truncateOptions[key], 10);
                });

                if (truncateOptions.hasOwnProperty("words") || truncateOptions.hasOwnProperty("characters")) {
                    // Legacy function: {{content words="0"}} should return leading tags.
                    if (truncateOptions.hasOwnProperty("words") && truncateOptions.words === 0) {
                        return downzero(this.description);
                    }

                    return downsize(this.description, truncateOptions);
                }

                return this.description;
            },
            resolve: function (path) {
                if (path && this.resourcePath && this.resourcePath !== "") {
                    return this.resourcePath + path;
                }
                return "." + path;
            },
            or: function (v1, v2) {
                return v1 || v2;
            }
        }
    };
};
