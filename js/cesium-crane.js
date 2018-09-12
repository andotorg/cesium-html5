/**
 * 对Cesium进行二次封装
 * author：andot
 * date: 2018年9月6日12:49:08
 * 
 */
var Cranegis = function () {
	/**
	 * 绘制中国国界线
	 * param:name 文字  
	 * param:url 国界线的数据文件， 一共有三个文件，缺一不可
	 * */
	Cranegis.prototype.drawBorderLine = function (name, url) {
        viewer.scene.debugShowFramesPerSecond = !0;
        var r = null;
        Cesium.when.all([Cesium.Resource.fetchBlob(url + ".shp"), Cesium.Resource.fetchBlob(url + ".dbf"), Cesium.Resource.fetchBlob(url + ".prj")], function(e) {
            e[0].name = name + ".shp",
                e[1].name = name + ".dbf",
                e[2].name = name + ".prj";
            var i = new Cesium.VectorTileImageryProvider({
                source: e,
                defaultStyle: {
                    outlineColor: "rgb(255,255,0)",
                    lineWidth: 2,
                    fill: !1,
                    tileCacheSize: 200
                },
                minimumLevel: 1,
                maximumLevel: 20,
                simplify: !1
            });
            i.readyPromise.then(function() {
                r = viewer.imageryLayers.addImageryProvider(i),
                    viewer.imageryLayers.raiseToTop(r),
                    viewer.flyTo(r),
                    Cesium.Camera.DEFAULT_VIEW_RECTANGLE = i.rectangle
            })
        })
    }
    
	/**
	 * 加载扩展插件，地图导航控件
	 * @param ["enableCompass", "enableZoomControls", "enableDistanceLegend", "enableCompassOuterRing"]  加载那些控件 
	 * defaultResetView - >用于在使用重置导航重置地图视图时设置默认视图控制。接受的值是Cesium.Cartographic 和 Cesium.Rectangle.
	 * enableCompass - >用于启用或禁用罗盘。true是启用罗盘，false是禁用罗盘。默认值为true。如果将选项设置为false，则罗盘将不会添加到地图中。
	 * enableZoomControls - >用于启用或禁用缩放控件。true是启用，false是禁用。默认值为true。如果将选项设置为false，则缩放控件将不会添加到地图中。
	 * enableDistanceLegend - >用于启用或禁用距离图例。true是启用，false是禁用。默认值为true。如果将选项设置为false，距离图例将不会添加到地图中。
	 * enableCompassOuterRing - >用于启用或禁用指南针外环。true是启用，false是禁用。默认值为true。如果将选项设置为false，则该环将可见但无效。
	 */
    Cranegis.prototype.loadMapViewTools = function (arr) {
	    var options = {};
		options.defaultResetView = Cesium.Rectangle.fromDegrees(71, 3, 90, 14);
		options.enableCompass= true;
		options.enableZoomControls= true;
		options.enableDistanceLegend= true;
		options.enableCompassOuterRing= true;
		viewer.extend(Cesium.viewerCesiumNavigationMixin, options);
    }
    
    /**
	 * 显示当前坐标位置
	 * @param divId 字符串， 自定义div的唯一标示
	 */
    Cranegis.prototype.show3DCoordinates = function (divId) {
        //地图底部工具栏显示地图坐标信息
        var elementbottom = document.createElement("div");
        $(".cesium-viewer").append(elementbottom);
        elementbottom.className = "mapfootBottom";
        var coordinatesDiv = document.getElementById(divId);
        if (coordinatesDiv) {
            coordinatesDiv.style.display = "block";
        }
        else {
            //var scale;
            var _divID_coordinates = divId;
            coordinatesDiv = document.createElement("div");
            coordinatesDiv.id = _divID_coordinates;
            coordinatesDiv.className = "map3D-coordinates";
            coordinatesDiv.innerHTML = "<span id='cd_label' style='font-size:13px;text-align:center;font-family:微软雅黑;color:#edffff;'>暂无坐标信息</span>";
            //document.getElementById(this.mapDivId).appendChild(coordinatesDiv);
            $(".cesium-viewer").append(coordinatesDiv);
            var handler3D = new Cesium.ScreenSpaceEventHandler(
                viewer.scene.canvas);
            handler3D.setInputAction(function(movement) {
            	var scalaWidth = 100, km = 100;
                var pick= new Cesium.Cartesian2(movement.endPosition.x,movement.endPosition.y);
                if(pick){
                    var cartesian = viewer.scene.globe.pick(viewer.camera.getPickRay(pick), viewer.scene);
                    if(cartesian){
                        //世界坐标转地理坐标（弧度）
                        var cartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
                        if(cartographic){
                            //海拔
                            var height = viewer.scene.globe.getHeight(cartographic);
                            //视角海拔高度
                            var he = Math.sqrt(viewer.scene.camera.positionWC.x * viewer.scene.camera.positionWC.x + viewer.scene.camera.positionWC.y * viewer.scene.camera.positionWC.y + viewer.scene.camera.positionWC.z * viewer.scene.camera.positionWC.z);
                            var he2 = Math.sqrt(cartesian.x * cartesian.x + cartesian.y * cartesian.y + cartesian.z * cartesian.z);
                            //地理坐标（弧度）转经纬度坐标
                            var point=[ cartographic.longitude / Math.PI * 180, cartographic.latitude / Math.PI * 180];
                            if(!height){
                                height = 0;
                            }
                            if(!he){
                                he = 0;
                            }
                            if(!he2){
                                he2 = 0;
                            }
                            if(!point){
                                point = [0,0];
                            }
                            coordinatesDiv.innerHTML = "<span id='cd_label' style='font-size:13px;text-align:center;font-family:微软雅黑;color:#edffff; position: relative; top: 10px;'>"+"视角海拔高度:"+(he - he2).toFixed(2)+"米"+"&nbsp;&nbsp;&nbsp;&nbsp;海拔:"+height.toFixed(2)+"米"+"&nbsp;&nbsp;&nbsp;&nbsp;经度：" + point[0].toFixed(6) + "&nbsp;&nbsp;纬度：" + point[1].toFixed(6)+ "</span>";
                        }
                    }
                }
            }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        }
        coordinatesDiv.style.position = "absolute";
        coordinatesDiv.style.bottom = "10px";
        coordinatesDiv.style.right = "100px";
    }
    
    /**
     * 加载Marker点
     * jsonData: {
     * 	Data: {
     * 		longitude: 125.56242
     * 		latitude: 36.54265
     * 	}
     * }
     */
    Cranegis.prototype.loadCraneMarker = function (markerOption) {
		$.getJSON(markerOption.jsonDataUrl, function(e) {
			addFeature(e.Data)
			dataSource.clustering.enabled = e;
		});
		$("#chkClustering").change(function() {
			var e = $(this).prop("checked");
			dataSource.clustering.enabled = e;
		});
		//标记坐标点
		function addFeature(e) {
			dataSource = new Cesium.CustomDataSource("myData"),
				$(e).each(function(e, t) {
					var boxhtml = '<table style="width: 300px;">';
					boxhtml += 		'<tr>';
					boxhtml +=       	'<th scope="col" colspan="4"  style="text-align:center;font-size:15px;">' + t.name + '</th>';
					boxhtml +=      '</tr>';
					boxhtml +=      '<tr> <td>等级：</td> <td>'+t.Type+'</td> </tr>';
					boxhtml +=      '<tr> <td>详细地址：</td><td>'+t.name+'</td></tr>';
					boxhtml +=      '<tr> <td colspan="4" style="text-align:right;"><a href="javascript:mineShowInfoMore(\'' + t.ID + "')\">更多</a></td></tr></table>";
					dataSource.entities.add({
						name: t.name,
						position: Cesium.Cartesian3.fromDegrees(t.longitude, t.latitude),
						billboard: {
							image: markerOption.iconUrl,
							scale: 1,
							horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
							verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
							heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
							scaleByDistance: new Cesium.NearFarScalar(150, 1.5, 8e6, .2)
						},
						data: t,
						dialog: {
							html: boxhtml
						}
					})
				}),
				//把坐标点显示在跟前
				/*viewer.flyTo(dataSource.entities, {
					duration: 3
				}),*/
				dataSource.clustering.enabled = !1,  //是否聚合
				dataSource.clustering.pixelRange = 20;
			var i = {},
				r = new Cesium.PinBuilder;
			dataSource.clustering.clusterEvent.addEventListener(function(e, t) {
				var a = e.length;
				t.label.show = !1,
					t.billboard.show = !0,
					t.billboard.id = t.label.id,
					t.billboard.verticalOrigin = Cesium.VerticalOrigin.BOTTOM,
				i[a] || (i[a] = r.fromText(a, Cesium.Color.BLUE, 48).toDataURL()),
					t.billboard.image = i[a]
			}),
			viewer.dataSources.add(dataSource)
		}
		
		/**
		 * 动态添加气泡窗口
		 */

		var removeHandler;
		var content;
		var autoInfoWindow;
		var infoDiv = '<div id="trackPopUp" style="display:none;">'+
		    '<div id="trackPopUpContent" class="leaflet-popup" style="top:5px;left:0;">'+
		    '<a class="leaflet-popup-close-button" href="#">×</a>'+
		    '<div class="leaflet-popup-content-wrapper">'+
		    '<div id="trackPopUpLink" class="leaflet-popup-content" style="max-width: 300px;"></div>'+
		    '</div>'+
		    '<div class="leaflet-popup-tip-container">'+
		    '<div class="leaflet-popup-tip"></div>'+
		    '</div>'+
		    '</div>'+
		    '</div>';
		$("#cesiumContainer").append(infoDiv);
		//在marker点上右键点击事件
		var handler3D = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
		handler3D.setInputAction(function(movement) {
		    viewer.scene.screenSpaceCameraController.enableRotate = true;
		    var pick = viewer.scene.pick(movement.position);
		    if(pick && pick.id){
		        $('#trackPopUp').show();
		        var cartographic = movement.position;
		        var point=[cartographic.x / Math.PI * 180, cartographic.y / Math.PI * 180];
		        var destination=Cesium.Cartesian3.fromDegrees(point[0], point[1], 3000.0);
		        var id=pick.id._id.replace(/[^0-9]/ig,"");

		        content = pick.id._dialog.html;

		        var obj = {position:movement.position,destination:destination,content:content};
		        infoWindow(obj);
		    }
		    else{
		        $('#trackPopUp').hide();
		    }
		}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
		//气泡弹窗显示方法
		function infoWindow(obj) {
		    var picked = viewer.scene.pick(obj.position);
		    if (Cesium.defined(picked)) {
		        var id = Cesium.defaultValue(picked.id, picked.primitive.id);
		        if (id instanceof Cesium.Entity) {
		            $(".cesium-selection-wrapper").show();
		            $('#trackPopUpLink').empty();
		            $('#trackPopUpLink').append(obj.content);

		            var c = new Cesium.Cartesian2(obj.position.x, obj.position.y);
		            $('#trackPopUp').show();
		            positionPopUp(c); // Initial position
		            // at the place item
		            // picked
		            removeHandler = viewer.scene.postRender.addEventListener(function () {
		                if(picked.id._polyline!=null){
		                    var pos={};
		                    pos.x=(id._polyline._positions._value["0"].x+id._polyline._positions._value[1].x)/2;
		                    pos.y=(id._polyline._positions._value["0"].y+id._polyline._positions._value[1].y)/2;
		                    pos.z=(id._polyline._positions._value["0"].z+id._polyline._positions._value[1].z)/2;
		                    var changedC = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene,pos);
		                }else{
		                    var changedC = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, id._position._value);
		                }// If things moved, move the
		                // popUp too
		                if ((c.x !== changedC.x) || (c.y !== changedC.y)) {
		                    positionPopUp(changedC);
		                    c = changedC;
		                }
		            });
		            // PopUp close button event handler
		            $('.leaflet-popup-close-button').click(function() {
		                $('#trackPopUp').hide();
		                $('#trackPopUpLink').empty();
		                $(".cesium-selection-wrapper").hide();
		                removeHandler.call();
		                return false;
		            });
		            return id;
		        }
		    }
		}
		//气泡弹窗位置
		function positionPopUp (c) {
		    console.log("=========>")
		    console.log(c)
		    var x = c.x - ($('#trackPopUpContent').width()) / 2;
		    var y = c.y - ($('#trackPopUpContent').height()) + 70;
		    $('#trackPopUpContent').css('transform', 'translate3d(' + x + 'px, ' + y + 'px, 0)');
		}
    }
    Cranegis.prototype.userButton = function (options) {
    	//自定义按钮,点击跳转到首页
		$(".cesium-viewer-toolbar").append('<button type="button" onclick="lindex(\''+options.locationUrl+'\')" class="cesium-button cesium-toolbar-button cesium-home-button" title="'+options.title+'">'+options.svgIcon+'</button>');
    }
    
}

/**
* 矿山气泡弹窗点击更多执行方法
*/
function mineShowInfoMore(mineNumber){
	alert(mineNumber)
}

function lindex(url){
	location.href = url;
}