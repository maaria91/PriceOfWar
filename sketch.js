//-----------------------------------------------------THE SET UP-----------------------------------------------------------//


var dropStrings; //we will have somethign called dropStrings
var drop = []; //the drop is made out of so many points so its an array - here we have to empty -for NOW.
var dropWidth = 150,
    dropHeight = 300; //how big the drop is // global variables will use in DRAW

var arrayCircles = []; //we know we will have many circles later in the code.. so we come here and introduce them
var numberCircles = 30; //specify the number. ((is this because were randomly generating them??))

var table;
var wars = [];
var timelinePoints = [];
var arrayRects = [];
var container = [];
var SHIFT;




//-----------------------------------------------------DATA & IMAGES IMPORT-----------------------------------------------------------//


function preload() { //HERE we preload the array of the circle dots --it is pulling it from the folder
    dropStrings = loadStrings('assets/DropXY2.txt');
    table = loadTable("Data/Inter-StateWarData.csv", "csv", "header");
} //this is how its done - always




//-----------------------------------------------THE SET UP FOR THE CANVAS FUNCTION-----------------------------------------------------//


function setup() { //NOW we set up the space which we will AFTERWARDS draw on.
    var myCanvas = createCanvas(windowWidth, windowHeight);
    myCanvas.parent('myContainer');
    imageMode(CORNERS);
    frameRate(50); //circle speed
    stroke(0);
    fill(150);

    SHIFT = createVector(width / 2, height / 2.4);

    img = loadImage("assets/Drop1DIV4.png"); // Load the image




    //fixing the X & Y of the drop shell
    var arrayStringCoordinates = dropStrings[0].split(" "); //pulling in the drop coordinates and splitting by SPAEC
    print(arrayStringCoordinates);
    arrayStringCoordinates.forEach(function (s) { //since we have 30 circles, we need a forEach statement
        var coordStrings = s.split(","); //splitting it up by comma.. now we have Xs and Ys 

        //-----------------------------------------------------YELLOW CAGE STET UP-----------------------------------------------------------//
        var x = float(coordStrings[0]); //converting a string to decimile (floating)
        var y = float(coordStrings[1]) - dropHeight / 2;
        var point = createVector(x * 1.8, y * 1.8); //creating the drop
        drop.push(point); //pushing point into drop --in the top of the page

    });
    //print(table.getRowCount() + "total rows in table");


    //-----------------------------------------------------Data Parse-----------------------------------------------------------//    
    //FILTERING DATA
    table.getRows().forEach(function (row) {
        var warName = row.getString("WarName");
        var participantName = row.getString("StateName");
        var startYear = int(row.getString("StartYear1"));
        var startMonth = int(row.getString("StartMonth1"));
        var startDay = int(row.getString("StartDay1"));
        var endYear = int(row.getString("EndYear1"));
        var endMonth = int(row.getString("EndMonth1"));
        var endDay = int(row.getString("EndDay1"));
        var deaths = int(row.getString("BatDeath"));

        var startDate = new ODate(startYear, startMonth, startDay);
        var endDate = new ODate(endYear, endMonth, endDay);
        var participant = new Participant(participantName, startDate, endDate, deaths);

        var war = getWar(warName);
        if (war == "false") {
            //create a new war
            var myWar = new War(warName);
            myWar.deaths = deaths;
            myWar.participants.push(participant);
            wars.push(myWar);

        } else {
            //fill the existing war with new data
            war.participants.push(participant);
        }

    });
    /* WAR FILTERED BY YEAR */
    function getWar(name) {
        for (var i = 0; i < wars.length; i++) {
            var war = wars[i];
            if (war.name == name) {
                return war;
            }

        }
        return "false";

    }

    //-------------------------------------------------THE TIMELINE SETUP-------------------------------------------------------//

    /*RECTS ACCORDING TO END AND START YEAR*/
    arrayRects.push(new SelectRect(1823, 1852));
    arrayRects.push(new SelectRect(1853, 1882));
    arrayRects.push(new SelectRect(1883, 1912));
    arrayRects.push(new SelectRect(1913, 1942));
    arrayRects.push(new SelectRect(1943, 1972));
    arrayRects.push(new SelectRect(1973, 2003));


    wars.forEach(function (war) {
        var max = 0;
        var min = 9999;

        war.participants.forEach(function (part) {

            if (getDecimalDate(part.endDate) > max) max = getDecimalDate(part.endDate);
            if (getDecimalDate(part.startDate) < min) min = getDecimalDate(part.startDate);
        });

        war.starDate = min;
        war.endDate = max;

    });

    wars.forEach(function (war) {
        var maxi = 1;
        var mini = 99999;

        war.participants.forEach(function (parti) {

            if (getNormalDate(parti.endDate) > maxi) maxi = getNormalDate(parti.endDate);
            if (getNormalDate(parti.startDate) < mini) mini = getNormalDate(parti.startDate);
        });

        war.WNstartDate = mini;
        war.WNendDate = maxi;

    });



    wars.forEach(function (war) {
        war.computeDeaths();

    });


}


var prevRectSelected = null;




//-----------------------------------------------------THE DRAW FUNCTION-----------------------------------------------------------//


function draw() { //HERE we beging the drawing process.. everythign we want to draw needs to be inside here.
    background(50, 50, 50);
    randomSeed(9);


    /*DRAWING THE RECTS*/
    arrayRects.forEach(function (c) {
        c.isMouseOver();
        c.draw();

    });

    var rectSelected = null;
    arrayRects.forEach(function (rect) {
        if (rect.active == true) {
            rectSelected = rect;

        }
    });




    if (rectSelected != prevRectSelected && rectSelected != null) {
        arrayCircles = [];

        //print(rectSelected);
        wars.forEach(function (war) {
            // print(war.starDate + " " + war.endDate);
            if (war.starDate >= rectSelected.start && war.endDate <= rectSelected.end) {

                var circle = new Circle(war);
                arrayCircles.push(circle);

            }

        });
        prevRectSelected = rectSelected;


    }



    //-----------------------------------------------------THE TOOLTIP-----------------------------------------------------------//


    function MousePos(circle) {
        print(circle);
      
        var mPos = createVector(mouseX, mouseY);
        var cpos = createVector(circle.pos.x + SHIFT.x, circle.pos.y + SHIFT.y);
        print(circle.radius + " " + mPos.dist(cpos));
    
        if (mPos.dist(cpos) <= circle.radius) {


            //the highlight circle around the war circles
            fill(255, 0, 0);
            stroke(255, 0, 0);
            ellipse(circle.pos.x + SHIFT.x, circle.pos.y + SHIFT.y, (circle.radius) * 2.20, circle.radius * 2.20)




            //information inside the tooltip - from data
            print(circle.radius + " " + mPos.dist(cpos));
            enteries = "War Name:" + "\n" + "Casualties";

            warStartDate = circle.war.WNstartDate
            warEndDate = circle.war.WNendDate
            Casualties = circle.war.totalDeaths

            details = circle.war.name + "   " + warStartDate + "-" + warEndDate  +"\n" + nfc(Casualties, 0) + " casualties";


            //drawing the toolip
            push();
            noStroke();
            fill(150);
            textSize(11);
            textLeading(18);
            text(details, 900 , 405)
            pop();
            
            

        }
        


    }


    arrayCircles.forEach(function (c) {
        MousePos(c);
    });



    //---------------------------------------------------DRAWING THE YELLOW CAGE-----------------------------------------------------------//

    translate(SHIFT.x, SHIFT.y); //location of the drop

    //scale(1.7);
    noStroke();
    stroke("yellow");
    //noFill();
    strokeWeight(1);
    drop.forEach(function (p) {
        //point(p.x, p.y);
    });
    
     //Setting up the background drop SVG
    push();
    translate(-131, -180);
    //scale(1.1);
    image(img, 0, 0);
    
    pop();


    //The circles
    for (var STEPS = 0; STEPS < 5; STEPS++) {
        //making a collision
        for (var i = 0; i < arrayCircles.length - 1; i++) {
            for (var j = i + 1; j < arrayCircles.length; j++) {
                var pa = arrayCircles[i];
                var pb = arrayCircles[j];
                var ab = p5.Vector.sub(pb.pos, pa.pos);
                var distSq = ab.magSq();
                if (distSq <= sq(pa.radius + pb.radius)) {
                    var dist = sqrt(distSq);
                    var overlap = (pa.radius + pb.radius) - dist;
                    ab.div(dist);
                    ab.mult(overlap * 0.5);
                    pb.pos.add(ab);
                    ab.mult(-1);
                    pa.pos.add(ab);


                    if (pa.testCollision()) {
                        pa.goInwards();
                    }

                    if (pb.testCollision()) {
                        pb.goInwards();
                    }

                }

            }
        }
    }

    arrayCircles.forEach(function (c) { //for each circle, update it then draw it
        c.update();
        c.draw();
    });




}


/*CONTROLLING THE WINDOW VIEW*/
//function windowResized() { //this is to allow the window to adjust with making it big or small 
//    resizeCanvas(windowWidth, windowHeight);
//
//}


/*setting up new variables to use*/
var ODate = function (AAAA, MM, DD) {
    this.year = AAAA;
    this.month = MM;
    this.day = DD;

}


function getDecimalDate(date) {
    return date.year + (date.month - 1) / 12 + (date.day - 1) / 365;
}


function getNormalDate(date) {
    return date.year
}

var War = function (name, startyear) {
    this.name = name;
    this.participants = [];
    this.deaths = [];
    this.totalDeaths = 0;

    this.computeDeaths = function () {
        var sum = 0;
        for (var i = 0; i < this.participants.length; i++) {
            sum += this.participants[i].deaths;
        }
        this.totalDeaths = sum;
    }

}


var Participant = function (country, startDate, endDate, deaths, participantName) {
    this.country = country;
    this.startDate = startDate;
    this.endDate = endDate;
    this.deaths = deaths;
}


var Circle = function (war) { //the position and movement of circles
    this.war = war;
    //this.pos = createVector(random(-1, 1), random(-1, 1));
    
    this.pos = createVector(random(-1, 1), 120+ random(-1, 1));


    //DO SOMETHING ABOUT ZEROS AND OTHER WEIRD NUMBERS
    //Doing sometihng to make the circles not too tiny and not too huge
    this.radius = sqrt(this.war.totalDeaths) / 7;
    if (this.radius < 5) this.radius = 5;
    if (this.radius > 40) this.radius = 40


    this.outwardsVelocity = createVector(random(-1, 1), random(-1, 1));

    this.outwardsVelocity.normalize();
    //this.outwardsVelocity.mult(-5);
    this.velocity = this.outwardsVelocity;
    //var center = createVector(50, 50);
    var center = createVector(0, 120);

    //SETTING UP WHAT WOULD HAPPEN IF IT COMES ON DROP BOARDER
    //this.innerVel = createVector(50, 50);

    this.hit = false;

    this.update = function () {

    }


    this.testCollision = function () {
        this.hit = collideCirclePoly(this.pos.x, this.pos.y, this.radius * 2, drop);
        return this.hit;
    }

    this.goInwards = function () {
        var vpush = p5.Vector.sub(center, this.pos);
        
        vpush.normalize();
        vpush.mult(3);
        this.pos.add(vpush);

    }

    //REACTION TO YELLOW CAGE
    this.draw = function () { //DRAWING the circles after we gave it all the above charactaristics 
        push();
        noStroke();

        //Color scale for circles
        var red = map(war.WNendDate - war.WNstartDate, 0, 7, 100, 255);
        if (red > 255) red = 255;

        fill(red, 0, 0);

        ellipse(this.pos.x, this.pos.y, this.radius * 2, this.radius * 2);
        pop();
    }
}



function changeBG() {
    var val = random(255);
    background(val);
}




//-----------------------------------------------------DRAWING THE TIMELINE-----------------------------------------------------------//


var SelectRect = function (start, end) {
    this.start = start;
    this.end = end;
    this.active = false;

    var totalWidth = 850;
    var yearsSpan = this.end - this.start;

    this.width = map(yearsSpan, 0, 2003 - 1823, 0, totalWidth);
    this.height = 13;


    this.x1 = map(this.start, 1823, 2003, 0, totalWidth) + 298;
    this.x2 = this.width + this.x1;
    this.y1 = 642 + 10;
    this.y2 = this.height + this.y1;

     this.draw = function () {
//        stroke("teal");
        noStroke()
        textSize(24);
//        fill("red");
//        fill(150, 150, 150);
//        noStroke();
        if (this.active) {
            fill(255, 0, 0, 50);
        } else noFill();
        //print(this.active);\
//        noFill()
        rect(this.x1, this.y1+6, this.width, this.height);
//        text(this.start, this.x1, this.y1);
//        text(this.end, this.x1, this.y1);
//        text(this.start, this.x1, this.y1);
//        text(this.end, this.x1+140, this.y1);
//        
//        fill(0, 102, 153);
        //print(this.x1);
    }


    //-----------------------------------------------------MOUSE OVER FUNCTION-------------------------------------------------------//

    this.isMouseOver = function () {
        if (mouseX < this.x2 && mouseX >= this.x1 && mouseY < this.y2 && mouseY >= this.y1) {
            this.active = true;



        } else this.active = false;

    }


}
