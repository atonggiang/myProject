class Controller extends Phaser.Scene{
    constructor(){
        super("Controller");

        this.dropX = 250;
        this.dropY = 500;
        this.dragX = 1200;
        this.dragY = 700;
    }
    preload(){
        this.load.svg('next_button','image/38.svg',{width:"200", height:"200"});
        this.load.svg('ball', 'image/35.svg',{width:"150", height:"150"});
        this.load.svg('book', 'image/39.svg',{width:"300", height:"300"});
        this.load.svg('drop', 'image/53.svg',{width:"500", height:"500"});
        this.load.svg('drop1', 'image/55.svg',{width:"500", height:"500"});
        this.load.svg('bag', 'image/41.svg',{width:"500", height:"500"});
        this.load.svg('cactus', 'image/45.svg',{width:"400", height:"400"});
        this.load.svg('sound', 'image/loa.svg',{width:"100", height:"100"});
    }


    create(){
        this.cameras.main.setBackgroundColor('#f5fffd');

        this.create_button();
        
        this.create_game();
    }

        
    create_game(){
        var ref = this;

        //setting up dropping zone
        this.drop = [];
        this.drop[0] = this.item_factory(this.dropX, this.dropY, "drop");   //infront is case 0
        this.drop[1] = this.item_factory(this.dropX, this.dropY, "drop1");  //behind is case 1

        
        var obstacle = [];
        obstacle[0] = {
            item: 'bag',
            offsetX: 0,
            offsetY: -180
        };
        obstacle[1] = {
            item: 'cactus',
            offsetX: 50,
            offsetY: -100
        };
        var randIndex2 = this.get_random_int(0,1);
        //setting up initial possition
        this.obstacle_item = this.item_factory(this.dropX + obstacle[randIndex2].offsetX, 
            this.dropY + obstacle[randIndex2].offsetY, obstacle[randIndex2].item);


        this.drag = [];
        this.drag[0] = {
            item: 'ball',
            offSet: [
                {
                    X: 0,
                    Y: -100
                },
                {   
                    X:-200,
                    Y: -200
                }
            ]
        };
        this.drag[1] = {
            item: 'book',
            offSet:[
                {
                    X: -50,
                    Y: -120
                },
                {
                    X: -200,
                    Y: -240
                }
            ]
        };

        this.dragType = this.get_random_int(0,1);  //track drag object type
        //setting up initial possition
        this.drag_item = this.item_factory(this.dragX, this.dragY, this.drag[ref.dragType].item);

        

        this.set_draggable( this.drag_item);
        this.set_droppable( this.drop[0]);
        this.set_droppable( this.drop[1]);

        //in front or behind case
        this.caseType = this.get_random_int(0,1);
        if(ref.caseType == 0)
            this.drag_and_drop(this.drag_item, this.drop[0], this.drop[1]);
        else 
            this.drag_and_drop(this.drag_item, this.drop[1], this.drop[0]);


        var s;
        if(ref.caseType == 0) s = 'in front of';
        else s = 'behind of'

        var sentence = 'Put the ' + this.drag[ref.dragType].item + ' ' + s + ' the ' + obstacle[randIndex2].item;
        //setting up text
        this.sentence = this.add.text(700, 200, sentence, 
            {
                fontSize: '40px',
                fontFamily: 'Arial',
                color: '#AAAAAAA',
                align: 'center',
                lineSpacing: 44,
            }
        ).setInteractive({ useHandCursor: true });
        this.sound = this.item_factory( 550, 170, 'sound');
        //setting up sound
        this.say(ref.sound,sentence);
        this.say(ref.sentence,sentence);
    }

    
    set_draggable  (dragItem)  {
        //set physics of the ball
        dragItem.setCollideWorldBounds(true);

        //allow items to be dragged
        this.input.setDraggable(dragItem);
    }


    set_droppable  (dropItem)  {
        //set drop item
        if(dropItem != null) 
            dropItem.input.dropZone = true;
    }


    drag_and_drop  (dragItem, dropItem, dropFake)  {
        
        //invoke when dragging
        this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
            gameObject.x = dragX;
            gameObject.y = dragY;
        });

        this.input.on('dragenter', function (pointer, gameObject, dropZone) {

            dropZone.setTint(0xffff000);
    
        });
    
        this.input.on('dragleave', function (pointer, gameObject, dropZone) {
    
            dropZone.clearTint();
    
        });

        this.input.on('dragend', function (pointer, gameObject, dropped) {
            // console.log(this);
            var ref = this;
            if (!dropped) this.animation(dragItem,ref.dragX,ref.dragY);
        }.bind(this));


        this.input.on('drop', function (pointer, gameObject, dropZone) {
            var ref = this;
            if(dropZone == dropFake){
                
                this.events.emit('addScore');

                dropZone.setTint(0xFF0000);

                this.animation(dragItem,ref.dragX,ref.dragY);
            }
            if(dropZone == dropItem ){
                gameObject.input.enabled = false;
                
                ref.animation_true_pos();

                dropZone.setTint(0x00ff00);
                
                setTimeout(function(){ref.trigger_next_scene()},3000);
            }   
            setTimeout(function(){dropZone.clearTint();},3000);
        }.bind(this));

        this.handle_button();
    }
    create_button(){
        var ref = this;
        //next button
        this.graphics1 = this.add.graphics()
        this.graphics1.fillStyle(0x0066CC, 0.75);

        this.nextButton = {
            rect: ref.graphics1.fillRoundedRect(1200, 400, 200, 50),
            text: this.add.text(1230, 398, 'Next >', 
                    {
                        fontSize: '50px',
                        fontFamily: 'Arial',
                        color: '#FFFFFF',
                        align: 'center',
                        lineSpacing: 44,
                    }
                ).setInteractive({ useHandCursor: true }),
            hide(){this.rect.setVisible(false),this.text.setVisible(false)},
            show(){this.rect.setVisible(true),this.text.setVisible(true)}
        };
        //hide the next button
        this.nextButton.hide();


        //back button
        this.graphics2 = this.add.graphics()
        this.graphics2.fillStyle(0x0066CC, 0.75);

        this.backButton = {
            rect: ref.graphics2.fillRoundedRect(100, 50 , 200 , 50),
            text: this.add.text(110, 48, '< Back', 
                {
                    fontSize: '50px',
                    fontFamily: 'Arial',
                    color: '#FFFFFF',
                    align: 'center',
                    lineSpacing: 44,
                }
            ).setInteractive({ useHandCursor: true })
        };
    }
    handle_button(){
        this.handle_back_button();
        this.handle_next_button();
    }

    handle_back_button(){
        var ref = this;
        this.backButton.text.once('pointerup',function(){
            window.location='index.html';
        })
    }
    handle_next_button(){
        var ref = this;
        this.nextButton.text.once('pointerup',function(){
            ref.events.emit('minusScore');
            setTimeout(function(){
                var tmp = ref.registry.get('score');
                
                //if finish score then next scene will be end-scene
                if(tmp <= 0){
                    //destroy UI scene
                    ref.UI = ref.scene.get('UIScene');
                    ref.UI.destroy();

                    //clear current game
                    ref.clear_current_game();
                    window.location='index.html';
                }
                //change to next scene 
                else {
                    ref.nextButton.hide();

                    ref.clear_current_game();
    
                    ref.create_game();
                }
            },3000)
        })
    }
    trigger_next_scene(){
        var ref = this;

        this.nextButton.show();    
    }

    clear_current_game(){

        console.log('clear scene');
        
        this.destroy(this.drop[0]);
        this.destroy(this.drop[1]);
        this.destroy(this.drag_item);
        this.destroy(this.obstacle_item);

        this.destroy(this.sound);
        this.destroy(this.sentence);
        
    }

    animation(item,pos_x,pos_y){
        var timeline = this.tweens.createTimeline();
                timeline.add({
                    targets: item,
                    x: pos_x,
                    y: pos_y,
                    ease: 'Power1',
                    duration: 1000
                });
                timeline.play();
    }

    animation_true_pos(){
        var ref = this;

        var offSetX = ref.drop[ref.caseType].x + ref.drop[ref.caseType].width/2 
        var offSetY = ref.drop[ref.caseType].y + ref.drop[ref.caseType].width/2 

        this.animation(ref.drag_item, offSetX + ref.drag[ref.dragType].offSet[ref.caseType].X, 
            offSetY + ref.drag[ref.dragType].offSet[ref.caseType].Y)
    
        //if the dropzone is behind then set obstacle to front
        if(ref.caseType == 1)
            this.obstacle_item.setDepth(1);
    }

    item_factory(posX, posY, item){
        return this.physics.add.sprite(posX ,posY, item).setInteractive({ pixelPerfect: true}).setOrigin(0,0);
    }

    say(item,m) {
        var ref = this;
        item.on('pointerdown', function (pointer) {
            var msg = new SpeechSynthesisUtterance();
            var voices = window.speechSynthesis.getVoices();
            msg.voice = voices[ref.get_random_int(0,10)];
            msg.voiceURI = "native";
            msg.volume = 1;
            msg.rate = 1;
            msg.pitch = 0.8;
            msg.text = m;
            msg.lang = 'en-US';
            speechSynthesis.speak(msg); 
        });
    }


    destroy(item){
        if(item!=null) {
            item.destroy(true);
            item = null;
        }
    }

    get_random_int(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

}
