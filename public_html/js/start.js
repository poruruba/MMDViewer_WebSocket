'use strict';

//var vConsole = new VConsole();

const websocket_url = "ws://【M5Core2のIPアドレス】:81";

var socket = null;

var mmd_base = "mmd/";
var pmx_list = [
    {
        fname: 'Mirai_Akari_v1.0/MiraiAkari_v1.0.pmx',
        title: 'ミライアカリ'
    },
    {
        fname: 'kizunaai/kizunaai.pmx',
        title: 'キヅナアイ'
    },
    {
        fname: 'miku/miku_v2.pmd',
        title: '初音ミク'
    },
    {
        fname: 'yuzuki/結月ゆかり_純_ver1.0.pmd',
        title: '結月ゆかり'
    },
    {
        fname: 'ando/安柏.pmx',
        title: 'アンバー'
    },
    {
        fname: 'wendi/温迪.pmx',
        title: 'ウエンティ'
    },
    {
        fname: 'kaiya/凯亚.pmx',
        title: 'ガイア'
    },
    {
        fname: 'qin/琴.pmx',
        title: 'ジン'
    },
    {
        fname: 'diluke/迪卢克.pmx',
        title: 'ディルック'
    },
    {
        fname: 'babala/芭芭拉.pmx',
        title: 'バーバラ'
    },
    {
        fname: 'paimeng/派蒙.pmx',
        title: 'パイモン'
    },
    {
        fname: 'feixieer/菲谢尔.pmx',
        title: 'フィッシュル'
    },
    {
        fname: 'lisha/丽莎.pmx',
        title: 'リサ'
    },
    {
        fname: 'ningguang/凝光.pmx',
        title: '凝光'
    },
    {
        fname: 'kong/空.pmx',
        title: '空'
    },
    {
        fname: 'ying/女主角.pmx',
        title: '蛍'
    },
    {
        fname: 'xiangling/香菱.pmx',
        title: '香菱'
    },
];
var stage_list = [
    {
        fname: "stage/stage.pmd",
        title: "stage"
    },
    {
    	fname: "ステンドグラスステージ/ステンドグラスステージ.pmx",
    	title: "ステンドグラスステージ",
    },
    {
    	fname: "legenders_stage/regenders-stage1.1.pmx",
    	title: "legenders_stage"
    }
];

var vmd_base = "mmd/vmds/";
var vmd_list = [
    "wavefile_v2.vmd",
    "wavefile_camera.vmd",
    "地球最後の告白を_Latミクv2.31S_b.vmd",
    "nichijou/あはははは.vmd",
    "nichijou/え、ホント！？.vmd"
];

var vpd_base = "mmd/vpds/";
var vpd_list = [
    "01.vpd",
    "02.vpd",
    "03.vpd",
    "04.vpd",
    "05.vpd",
    "06.vpd",
    "07.vpd",
    "08.vpd",
    "09.vpd",
    "10.vpd",
    "11.vpd",
];

var vue_options = {
    el: "#top",
    data: {
        progress_title: '', // for progress-dialog

        stage_list: stage_list,
        character_list: pmx_list,
        animation_list: vmd_list,
        pose_list: vpd_list,
        selecting: {
            index: -1,
            mmd: null,
            pause: false,
            vmd_index: 0,
            vpd_index: 0
        },
        selecting_type: "vmd",
        selecting_stage: "",
        width: 320,
        height: 240,
        quality: 50,
        duration: 200,
        start_tick : 0,
        websocket_url: websocket_url,
    },
    computed: {
    },
    methods: {
        pause_resume: async function(){
            if( !this.selecting.mmd )
                return;

            if( !this.selecting.pause ){
                this.selecting.mmd.pause_animate();
                this.selecting.pause = true;
            }else{
                this.selecting.mmd.start_animate();
                this.selecting.pause = false;
            }
        },
        select_change: async function(){
            if( this.selecting.index < 0 )
                return;

            if( this.selecting.mmd )
                this.selecting.mmd.dispose();

            if( socket )
                socket.close();
            socket = new WebSocket(this.websocket_url);
            socket.binaryType = 'arraybuffer';
            socket.onopen = () => {
                console.log("websocket opened");
            };

            this.start_tick = 0;
            this.selecting.mmd = new MmdView($('#canvas_0')[0], this.width, this.height );
            this.selecting.mmd.setCallback((canvas) =>{
                if( socket.bufferedAmount <= 0 ){
                    var end_tick = new Date().getTime();
                    if( this.start_tick == 0 || ((end_tick - this.start_tick) >= this.duration)){
                        this.start_tick = end_tick;
                        canvas.toBlob((blob) =>{
                            socket.send(blob);
                        }, "image/jpeg", this.quality / 100);
                    }
                }
            });
        
            try{
                this.progress_open();
                if( this.selecting_type == 'vmd'){
                    await this.selecting.mmd.loadWithAnimation(
                        mmd_base + this.character_list[this.selecting.index].fname, vmd_base + this.animation_list[this.selecting.vmd_index], this.selecting_stage ? mmd_base + this.selecting_stage : "");
                }else if( this.selecting_type == 'vpd'){
                    await this.selecting.mmd.loadWithPose(
                        mmd_base + this.character_list[this.selecting.index].fname, vpd_base + this.pose_list[this.selecting.vpd_index], this.selecting_stage ? mmd_base + this.selecting_stage : "" );
                }
            }catch(error){
                console.error(error);
                alert(error);
            }finally{
                this.progress_close();
            }
        },
    },
    created: function(){
    },
    mounted: function(){
        proc_load();
    }
};
vue_add_methods(vue_options, methods_bootstrap);
vue_add_components(vue_options, components_bootstrap);
var vue = new Vue( vue_options );
