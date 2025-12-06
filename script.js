const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const submit = $("#submit");
const Audio = $("#audio");

const IMG = $$(".LacBC");
const Chips = $$(".ChipsCoin");
const ChooseBC = $$(".ChooseBC");

const PlateLidPlace = $("#PlateLidPlace");
const PlateLid = $("#PlateLid");
const Lid = $("#Lid");
const LidIn = $("#LidIn");
const closeShake = $("#closeShake");
const balanceText = $("#balanceText");
const ShowBet = $("#ShowBet");
const more = $("#more");

var Balance = 0;
const XiNgau = ["Nai.png", "Bau.png", "Ga.png", "Ca.png", "Cua.png", "Tom.png"];
const PriceChip = [100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000];
const NameBC = ["Nai", "Bầu", "Gà", "Cá", "Cua", "Tôm"];
var ValueBC = [0, 0, 0, 0, 0, 0];
var ResultBet = ["Cua", "Cua", "Cua"];
var ChipNow = PriceChip[0];
var CanSub = true;

// --- XỬ LÝ COOKIE & TIỀN ---
function setCookie(cname, cvalue, exdays = 365) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    let name = cname + "=";
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function checkCookie() {
    let money = getCookie("money");
    if (money != "") {
        Balance = parseInt(money);
    } else {
        Balance = 500000; // Tiền mặc định cho người mới
    }
    ChangeBalance();
};

// Chạy lần đầu
checkCookie();

// --- HIỆU ỨNG THÔNG BÁO TIỀN (+/-) ---
function showFloatingMoney(amount, x, y) {
    const el = document.createElement('div');
    el.classList.add('money-notify');
    
    if (amount > 0) {
        el.classList.add('money-plus');
        el.textContent = "+" + ConvertMoney(amount);
    } else {
        el.classList.add('money-minus');
        el.textContent = "-" + ConvertMoney(Math.abs(amount));
    }

    // Nếu không truyền tọa độ (ví dụ khi thắng tiền), hiện ở giữa màn hình
    if (x === undefined || y === undefined) {
        el.style.left = "50%";
        el.style.top = "40%";
        el.style.transform = "translate(-50%, -50%)"; // Căn giữa chuẩn
    } else {
        el.style.left = x + "px";
        el.style.top = y + "px";
    }

    document.body.appendChild(el);

    // Xóa element sau khi animation xong (1.5s)
    setTimeout(() => {
        el.remove();
    }, 1500);
}

// --- XỬ LÝ NÚT LẮC ---
submit.addEventListener("click", () => {
    if (CanSub) {
        // Kiểm tra xem có ai đặt cược chưa, nếu chưa đặt thì cảnh báo nhẹ (tuỳ chọn)
        // let totalBet = ValueBC.reduce((a, b) => a + b, 0);
        
        CanSub = false;
        closeShake.style.display = "none";
        Audio.load();
        submit.classList.add("block");
        PlateLidPlace.style.display = "flex";
        
        // Reset nắp
        Lid.style.animation = "none"; 
        Lid.style.transform = "translateX(0)";
        Lid.style.opacity = "1";
        
        setTimeout(() => {
            Audio.play();
            PlateLid.classList.add("shake");
            RandomBauCua(); // Chạy hàm xử lý kết quả (đã chỉnh sửa)
            LidIn.style.display = "initial";
            Lid.style.display = "none";
        }, 500); 
    }
});

// --- MENU MOBILE ---
$("#closeFN_mb").onclick = function() {
    $("#FunctionBTN_mb").style.display = "none";
};

more.addEventListener("click", () => {
    $("#FunctionBTN_mb").style.display = "flex";
});

// --- ĐÓNG KẾT QUẢ ---
closeShake.addEventListener("click", () => {
    CanSub = true;
    submit.classList.remove("block");
    PlateLidPlace.style.display = "none";
    let RemoveChip = document.getElementsByClassName("chipBet");
    while (RemoveChip.length > 0) {
        RemoveChip[0].parentNode.removeChild(RemoveChip[0]);
    };
});

// --- HÀM XỬ LÝ KẾT QUẢ (THUẬT TOÁN NHÀ CÁI THẮNG) ---
function RandomBauCua() {
    let finalIndices = [0, 0, 0];
    let minLossForHouse = Infinity; 
    let totalBetOnTable = ValueBC.reduce((a, b) => a + b, 0);

    // Nếu không ai cược thì random thật
    if (totalBetOnTable === 0) {
        finalIndices = [
            Math.floor(Math.random() * 6),
            Math.floor(Math.random() * 6),
            Math.floor(Math.random() * 6)
        ];
    } else {
        // Thuật toán: Quay thử 50 lần, chọn kết quả nào Admin trả ít tiền nhất
        for (let k = 0; k < 50; k++) {
            let r1 = Math.floor(Math.random() * 6);
            let r2 = Math.floor(Math.random() * 6);
            let r3 = Math.floor(Math.random() * 6);
            
            let counts = [0, 0, 0, 0, 0, 0];
            counts[r1]++; counts[r2]++; counts[r3]++;
            
            let currentPayout = 0;
            for (let i = 0; i < 6; i++) {
                if (ValueBC[i] > 0 && counts[i] > 0) {
                    currentPayout += ValueBC[i] + (ValueBC[i] * counts[i]);
                }
            }
            
            if (currentPayout < minLossForHouse) {
                minLossForHouse = currentPayout;
                finalIndices = [r1, r2, r3];
            }
            if (currentPayout === 0) break; 
        }
    }
    
    // Áp dụng kết quả hình ảnh
    IMG.forEach(function(userItem, index) {
        let indexRD = finalIndices[index];
        userItem.src = "BauCua/" + XiNgau[indexRD];
        ResultBet[index] = NameBC[indexRD];
    });

    setTimeout(() => {
        PlateLid.classList.remove("shake");
        Audio.pause();
        LidIn.style.display = "none";
        Lid.style.display = "initial";
        
        // Hiệu ứng mở nắp
        Lid.style.animation = "moveLid 1s forwards";

        closeShake.style.display = "initial";
        
        let totalWinMoney = 0;

        // Hoàn tiền vốn + tiền thắng
        // Cách tính cũ của bạn: Cộng từng con, nếu trúng thì cộng thêm.
        // Logic chuẩn: Nếu trúng, trả lại vốn + tiền thắng. 
        // Code cũ của bạn đang cộng dồn vào Balance nên ta giữ nguyên logic hiển thị.
        
        // 1. Cộng tiền trúng
        for (var i = 0; i < ResultBet.length; i++) {
            let indexWin = NameBC.indexOf(ResultBet[i]);
            if (ValueBC[indexWin] > 0) {
                Balance += ValueBC[indexWin]; // Cộng tiền thắng (theo tỉ lệ 1:1 mỗi con)
                totalWinMoney += ValueBC[indexWin];
            }
        }
        
        // 2. Hoàn lại vốn cho những ô trúng
        // Duyệt qua các ô đã đặt, nếu ô đó có trong kết quả thì hoàn vốn
        for (var i = 0; i < ValueBC.length; i++) {
            if (ValueBC[i] > 0 && ResultBet.includes(NameBC[i])) {
                Balance += ValueBC[i]; // Hoàn vốn
                totalWinMoney += ValueBC[i];
            }
            
            // Reset tiền cược trên bàn
            ValueBC[i] = 0;
            $("#BetNowBC" + i).textContent = NameBC[i] + ": 0$";
        }

        ChangeBalance();

        // HIỆN THÔNG BÁO THẮNG LỚN (Nếu có ăn tiền)
        if (totalWinMoney > 0) {
            setTimeout(() => {
                showFloatingMoney(totalWinMoney); // Hiện giữa màn hình
                Swal.fire({
                    icon: 'success',
                    title: 'Chúc Mừng!',
                    text: 'Bạn đã thắng: ' + ConvertMoney(totalWinMoney) + '$',
                    timer: 2000,
                    showConfirmButton: false
                });
            }, 500);
        } else if (totalBetOnTable > 0) {
            // Nếu có đặt mà thua trắng
             Swal.fire({
                icon: 'error',
                title: 'Thua Rồi!',
                text: 'Chúc bạn may mắn lần sau!',
                timer: 1500,
                showConfirmButton: false
            });
        }

    }, 1500);
}

// --- CHỌN CHIP ---
Chips.forEach((item, index) => {
    item.onclick = function() {
        $(".ChipsCoin.ChipsActive").classList.remove("ChipsActive");
        this.classList.add("ChipsActive");
        ChipNow = PriceChip[index];
    };
});

// --- ĐẶT CƯỢC (ĐÃ SỬA RESPONSIVE + THÔNG BÁO TRỪ TIỀN) ---
ChooseBC.forEach((item, index) => {
    item.onclick = function(e) { // Thêm tham số e (event) để lấy toạ độ chuột
        if (ChipNow <= Balance) {
            // Tính toán vị trí chip ngẫu nhiên trong ô (Responsive)
            let boxSize = item.offsetWidth;
            let coordT = Math.floor(Math.random() * (boxSize - 40)); 
            let coordL = Math.floor(Math.random() * (boxSize - 40));
            
            // Trừ tiền
            Balance -= ChipNow;
            
            // Hiện thông báo trừ tiền ngay tại chỗ click chuột
            // Dùng e.clientX và e.clientY để lấy vị trí ngón tay/chuột
            let mouseX = e.clientX || e.pageX;
            let mouseY = e.clientY || e.pageY;
            
            // Fix lỗi trên mobile đôi khi touch không ra clientX chuẩn, fallback về giữa ô
            if (!mouseX) {
                let rect = item.getBoundingClientRect();
                mouseX = rect.left + rect.width / 2;
                mouseY = rect.top + rect.height / 2;
            }

            showFloatingMoney(-ChipNow, mouseX, mouseY);

            // Thêm hình chip vào bàn
            item.insertAdjacentHTML("beforeend", `<img class='chipBet' style='top:${coordT}px; left:${coordL}px;' src='Chips/Chip${ChipNow}.png'>`)
            
            ValueBC[index] += ChipNow;
            $("#BetNowBC" + index).textContent = NameBC[index] + ": " + ConvertMoney(ValueBC[index]) + "$";
            ChangeBalance();
        } else {
            Swal.fire(
                'Không Đủ Tiền',
                'Số tiền đặt cược vượt quá số tiền hiện có...',
                'error'
            )
        }
    };
});

// --- CÁC HÀM HỖ TRỢ ---
function ChangeBalance() {
    balanceText.textContent = "Tài sản: " + ConvertMoney(Balance) + " VNĐ";
    setCookie("money", Balance);
}

function ConvertMoney(money) {
    return money.toLocaleString('vi-VN');
}

function OpenDetail() {
    ShowBet.style.display = "flex";
    $("#FunctionBTN_mb").style.display = "none";
}

function CloseDetail() {
    ShowBet.style.display = "none";
}

function ResetMoney() {
    Balance = 500000;
    ChangeBalance();
    Swal.fire(
        'Phục Hồi Thành Công',
        'Tài sản của bạn đã phục hồi về mức ban đầu...',
        'success'
    )
}