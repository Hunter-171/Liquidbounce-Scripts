/// api_version=2
var script = registerScript({
    name: "ReTargetHUD",
    version: "1.0.0",
    authors: ["Hunter171"]
});

var KillAura = Java.type("net.ccbluex.liquidbounce.LiquidBounce").moduleManager.getModule(Java.type("net.ccbluex.liquidbounce.features.module.modules.combat.KillAura").class),
Keyboard = Java.type('org.lwjgl.input.Keyboard'),
ScaledResolution = Java.type("net.minecraft.client.gui.ScaledResolution"),
Mouse = Java.type('org.lwjgl.input.Mouse'),
Fonts = Java.type("net.ccbluex.liquidbounce.ui.font.Fonts"),
GuiInventory = Java.type("net.minecraft.client.gui.inventory.GuiInventory");
GuiChat = Java.type('net.minecraft.client.gui.GuiChat'),
GL11 = Java.type("org.lwjgl.opengl.GL11"),
GlStateManager = Java.type("net.minecraft.client.renderer.GlStateManager"),
fr = mc.fontRendererObj,
Gui = Java.type("net.minecraft.client.gui.Gui");

var countDown = 0;
var posX = 0,posY = 0;
var width = 100,height = 100;
var lastLeftClick = false;
var dragging = false;

script.registerModule({
    name: "ReTargetHUD",
    category: "Fun", 
    description: "TargetHUD for Liquidbounce",
    tag: "test",
    settings: {
        mode: Setting.list({
            name: 'Mode',
            default: 'Astolfo',
			values: ['Astolfo', 'Exhibition', 'Liquidbounce','Custom']
        }),
        cwidth: Setting.integer({
            name: "Custom Width",
            default: 100,
            min: 1,
            max: 1000
        }),
        cheight: Setting.integer({
            name: "Custom Height",
            default: 100,
            min: 1,
            max: 1000
        })
    }
}, function (module) {
    module.on("disable", function() {
        mc.gameSettings.keyBindUseItem.pressed = false;
    }),
    module.on("update", function() {
        if(KillAura.target == null)
            countDown--;
    }),
    module.on("render2D", function() {
        module.tag = KillAura.target;
        if(KillAura.target != null)
            countDown = 1;

        var sr = new ScaledResolution(mc);

        if(Mouse.isButtonDown(0) && isInBox(Mouse.getX()/sr.getScaleFactor(), sr.getScaledHeight() - Mouse.getY()/sr.getScaleFactor()) && !lastLeftClick && mc.currentScreen instanceof GuiChat)
            onClick(Mouse.getX(),Mouse.getY());
        else if(!Mouse.isButtonDown(0) && lastLeftClick || !(mc.currentScreen instanceof GuiChat))
            onRelease();
        
        if(dragging) {
            posX += Mouse.getDX()/sr.getScaleFactor();
            posY -= Mouse.getDY()/sr.getScaleFactor();
        }

        if(posX < 0) posX = 0;
        if(posY < 0) posY = 0;
        if(posX > sr.getScaledWidth()) posX = sr.getScaledWidth();
        if(posY > sr.getScaledHeight()) posY = sr.getScaledHeight();

        if(countDown > 0 || mc.currentScreen instanceof GuiChat)
            draw(posX,posY,KillAura.target == null ? mc.thePlayer : KillAura.target, module);
        
        lastLeftClick = Mouse.isButtonDown(0);
    });
});

function draw(x,y, en, m) {
    var settings = m.settings;
    switch(settings.mode.get()) {
        case "Astolfo":
            width = 140;
            height = 52;
            Gui.drawRect(x,y,x+width,y+height, 0x90000000);
            GlStateManager.color(1,1,1);
            GuiInventory.drawEntityOnScreen(x + 16, y + 48.5, 22, -100, 0, en);
            fr.drawStringWithShadow(en.getName(),x+34,y+5,-1);

            GlStateManager.scale(2,2,1);
            fr.drawStringWithShadow(en.getHealth().toFixed(1).replace(".",",") + "❤",(x+34)/2,(y+19)/2,-1);
            GlStateManager.scale(0.5,0.5,1);

            Gui.drawRect(x+34,y+41,x+34+(102/en.getMaxHealth())*en.getHealth(),y+48,-1);
            break;
        case "Liquidbounce":
            width = 120;
            height = 38;
            Gui.drawRect(x,y,x+width,y+height, 0xFF000000);
            Fonts.font40.drawStringWithShadow(en.getName(),x+35,y+4,-1);
            Fonts.font35.drawStringWithShadow("Distance: " + mc.thePlayer.getDistanceToEntity(en).toFixed(2),x+35,y+15,-1);
            drawFace(en,x+1,y+1,30);
            Gui.drawRect(x+1,y+34,x+119,y+36, 0xFFFC6042);
            break;
        case "Custom":
            width = settings.cwidth.get();
            height = settings.cheight.get();
            Gui.drawRect(x,y,x+width,y+height,-1);
            break;
    }

}

function onClick(mouseX,mouseY) {

    dragging = true;

}

function onRelease() {

    dragging = false;

}

function isInBox(x,y) {
    return x > posX && x < posX + width && y > posY && y < posY + height;
    
}

function drawFace(en, x, y, scale) {
    mc.getTextureManager().bindTexture(en.getLocationSkin());
    GL11.glColor4f(1, 1, 1, 1);
    Gui.drawScaledCustomSizeModalRect(x, y, 8, 8, 8, 8, scale, scale, 64, 64);
}