// Built-in study questions based on the user-provided week 9 PDF.
window.STUDY_QUEST_PACKS = {
  "core": {
    "title": "컴퓨터구조 9주차 | 핵심 10문제",
    "description": "개념 + 실전 적용 · 강의 자료 쪽수 제공",
    "questions": [
      {
        "topic": "MUX·DEMUX",
        "sourcePage": 5,
        "question": "셋톱박스·게임기·PC 중 한 화면만 모니터에 연결하려고 한다. 가장 적절한 회로는?",
        "options": [
          "멀티플렉서(MUX)",
          "디멀티플렉서(DEMUX)",
          "명령 레지스터(IR)",
          "누산기(AC)"
        ],
        "answerIndex": 0,
        "explanation": "MUX는 여러 입력 가운데 선택 신호로 한 입력만 골라 하나의 출력에 연결해. 강의 자료에서도 HDMI 셀렉터가 같은 예시로 제시돼.",
        "hint": "입력은 여러 개, 결과가 나가는 출력은 하나야.",
        "skill": "적용"
      },
      {
        "topic": "MUX·DEMUX",
        "sourcePage": 8,
        "question": "4×1 MUX에서 S1=1, S0=0이다. 출력 F에 연결되는 입력은?",
        "options": [
          "D0",
          "D1",
          "D2",
          "D3"
        ],
        "answerIndex": 2,
        "explanation": "선택선 S1S0=10은 이진수 2를 뜻하므로 D2가 출력에 연결돼. 자료의 진리표는 00→D0, 01→D1, 10→D2, 11→D3야.",
        "hint": "선택선 두 비트를 이진수로 읽어 봐.",
        "skill": "적용"
      },
      {
        "topic": "MUX·DEMUX",
        "sourcePage": 11,
        "question": "스마트폰의 오디오 신호 하나를 이어폰·스피커·앰프 중 지정한 곳으로만 보내려면?",
        "options": [
          "MUX로 입력 여러 개를 선택한다",
          "DEMUX로 하나의 입력을 선택된 출력에 보낸다",
          "ALU에서 더하기를 실행한다",
          "MAR에 장치 주소를 저장한다"
        ],
        "answerIndex": 1,
        "explanation": "DEMUX는 한 입력을 받아 선택선으로 정해진 출력 하나로 분배하는 회로야. 여러 입력 중 하나를 고르는 MUX와 방향이 반대야.",
        "hint": "하나의 입력이 여러 출력 중 한 곳으로 이동해.",
        "skill": "적용"
      },
      {
        "topic": "표시 장치",
        "sourcePage": 15,
        "question": "숫자 0~9를 표시하는 7세그먼트의 기본 구성에 대한 설명으로 맞는 것은?",
        "options": [
          "7개의 독립된 획으로 숫자를 조합한다",
          "7비트 메모리 주소를 저장한다",
          "7개의 입력 장치를 하나로 합친다",
          "7개의 CPU 코어가 필요하다"
        ],
        "answerIndex": 0,
        "explanation": "7세그먼트는 a~g의 7개 획을 조합해 숫자를 표시하는 장치야. 강의 자료에는 BCD-7세그먼트 디코더의 연결도 나와 있어.",
        "hint": "7은 CPU 개수가 아니라 숫자를 그리는 획의 개수야.",
        "skill": "이해"
      },
      {
        "topic": "CPU 구성",
        "sourcePage": 22,
        "question": "명령어를 가져와 해독하고 다른 장치에 제어 신호를 보내는 CPU 구성 요소는?",
        "options": [
          "ALU",
          "제어 장치(CU)",
          "누산기(AC)",
          "데이터 버스"
        ],
        "answerIndex": 1,
        "explanation": "CU는 명령어를 인출·해독하고 실행에 필요한 제어 신호를 생성해. 반면 ALU는 산술 및 논리 연산 자체를 수행해.",
        "hint": "계산 담당과 명령 지휘 담당을 구분해 봐.",
        "skill": "이해"
      },
      {
        "topic": "레지스터",
        "sourcePage": 34,
        "question": "CPU가 다음에 가져올 명령어 주소를 확인하려 한다. 읽어야 할 레지스터는?",
        "options": [
          "IR",
          "PC",
          "MDR",
          "AC"
        ],
        "answerIndex": 1,
        "explanation": "PC(프로그램 카운터)는 다음에 인출할 명령어 주소를 저장해. IR은 이미 인출한 현재 명령어를 담아 두는 레지스터야.",
        "hint": "현재 명령어 내용이 아니라 다음 주소를 찾고 있어.",
        "skill": "적용"
      },
      {
        "topic": "레지스터",
        "sourcePage": 33,
        "question": "CPU가 메모리 120번지에서 데이터를 읽으려 할 때, 주소 120을 넣는 레지스터는?",
        "options": [
          "MAR",
          "MDR",
          "IR",
          "AC"
        ],
        "answerIndex": 0,
        "explanation": "MAR에는 접근할 메모리의 주소를 저장해. 읽어 온 데이터 자체를 임시 보관하는 역할은 MDR(또는 MBR)이 담당해.",
        "hint": "메모리의 위치(주소)와 그 위치에서 읽은 데이터는 달라.",
        "skill": "적용"
      },
      {
        "topic": "데이터 이동",
        "sourcePage": 36,
        "question": "주기억 장치의 데이터를 레지스터로 가져오는 명령어는?",
        "options": [
          "STORE",
          "MOVE",
          "LOAD",
          "ADD"
        ],
        "answerIndex": 2,
        "explanation": "LOAD는 주기억 장치 → 레지스터, STORE는 레지스터 → 주기억 장치, MOVE는 레지스터 → 레지스터 이동이야.",
        "hint": "메모리에서 CPU 쪽으로 읽어 오는 동작이야.",
        "skill": "이해"
      },
      {
        "topic": "명령어 형식",
        "sourcePage": 40,
        "question": "R1=5, R2=3일 때 2-주소 명령어 ADD R1, R2를 실행했다. 결과는?",
        "options": [
          "R1=5, R2=8",
          "R1=8, R2=3",
          "R1=8, R2=8",
          "R1=5, R2=3"
        ],
        "answerIndex": 1,
        "explanation": "자료의 2-주소 형식은 R1 ← R1 + R2야. 따라서 R1은 5+3=8로 바뀌고, R2는 3을 유지해.",
        "hint": "연산 결과가 첫 번째 피연산자 R1에 저장돼.",
        "skill": "적용"
      },
      {
        "topic": "반복 제어",
        "sourcePage": 56,
        "question": "종점 테스트(post-test) 방식 반복문이 처음부터 조건에 맞지 않더라도 본문이 실행되는 횟수는?",
        "options": [
          "0회",
          "최소 1회",
          "정확히 2회",
          "항상 10회"
        ],
        "answerIndex": 1,
        "explanation": "종점 테스트는 본문을 먼저 실행하고 마지막에 반복 조건을 검사하므로 적어도 한 번 실행돼.",
        "hint": "조건을 본문 앞이 아니라 뒤에서 검사해.",
        "skill": "이해"
      }
    ]
  },
  "advanced": {
    "title": "컴퓨터구조 9주차 | 응용 10문제",
    "description": "선택선과 명령어 계산 중심",
    "questions": [
      {
        "topic": "MUX·DEMUX",
        "sourcePage": 9,
        "question": "8×1 MUX에서 선택선 S2S1S0가 101일 때 선택되는 입력은?",
        "options": [
          "D3",
          "D4",
          "D5",
          "D6"
        ],
        "answerIndex": 2,
        "explanation": "101₂는 5이므로 D5가 선택돼. 자료 9쪽의 8×1 MUX 예시는 선택선 3개로 8개 입력 중 하나를 고르는 구조야.",
        "hint": "선택선 101을 10진수로 바꾸면 돼.",
        "skill": "적용"
      },
      {
        "topic": "MUX·DEMUX",
        "sourcePage": 11,
        "question": "DEMUX에서 선택선이 3개라면 가능한 출력선은 몇 개일까?",
        "options": [
          "3개",
          "6개",
          "8개",
          "9개"
        ],
        "answerIndex": 2,
        "explanation": "자료는 선택선 n개에 대해 출력선이 2ⁿ개 가능하다고 설명해. n=3이면 2³=8개야.",
        "hint": "2의 3제곱을 계산해 봐.",
        "skill": "적용"
      },
      {
        "topic": "표시 장치",
        "sourcePage": 16,
        "question": "BCD-7세그먼트 자료에서 입력 DCBA=1001이 나타내는 십진 숫자는?",
        "options": [
          "1",
          "7",
          "8",
          "9"
        ],
        "answerIndex": 3,
        "explanation": "BCD에서는 1001₂가 십진수 9를 뜻해. 자료 16쪽 진리표에는 0000부터 1001까지 숫자 표시를 위한 입력이 나와 있어.",
        "hint": "1001₂ = 8 + 1이야.",
        "skill": "적용"
      },
      {
        "topic": "레지스터",
        "sourcePage": 33,
        "question": "메모리에서 읽어 온 데이터 자체를 CPU 안에 잠시 보관할 때 사용하는 레지스터는?",
        "options": [
          "MAR",
          "MDR(MBR)",
          "PC",
          "IR"
        ],
        "answerIndex": 1,
        "explanation": "MDR 또는 MBR은 메모리에서 가져온 데이터나 기록할 데이터를 일시 저장해. MAR은 그 데이터가 있는 주소를 저장하는 레지스터야.",
        "hint": "MAR은 주소, 이 문제는 데이터 자체를 묻고 있어.",
        "skill": "이해"
      },
      {
        "topic": "레지스터",
        "sourcePage": 34,
        "question": "CPU가 명령어를 인출한 뒤, 제어 장치가 해독할 명령어를 담아 두는 레지스터는?",
        "options": [
          "IR",
          "PC",
          "SP",
          "MAR"
        ],
        "answerIndex": 0,
        "explanation": "IR(명령 레지스터)은 인출한 현재 명령어를 저장해 CU가 해독하도록 해. PC는 다음 명령어의 주소를 저장해.",
        "hint": "이미 가져온 현재 명령어의 내용이야.",
        "skill": "이해"
      },
      {
        "topic": "명령어 형식",
        "sourcePage": 39,
        "question": "AC=4, 메모리 X번지 값=7일 때 1-주소 명령 ADD X의 실행 후 AC 값은?",
        "options": [
          "4",
          "7",
          "11",
          "28"
        ],
        "answerIndex": 2,
        "explanation": "강의 자료의 1-주소 ADD X는 AC ← AC + M[X]야. 4+7=11이며 결과는 누산기 AC에 저장돼.",
        "hint": "ADD X의 두 번째 피연산자는 암묵적으로 AC야.",
        "skill": "적용"
      },
      {
        "topic": "명령어 형식",
        "sourcePage": 41,
        "question": "R2=6, R3=4일 때 3-주소 명령 ADD R1, R2, R3를 실행하면?",
        "options": [
          "R1=10, R2와 R3는 유지",
          "R2=10, R1과 R3는 유지",
          "R3=10, R1과 R2는 유지",
          "R1=6, R2=4, R3=10"
        ],
        "answerIndex": 0,
        "explanation": "3-주소 명령어는 R1 ← R2 + R3이야. 6+4=10이 R1에 기록되고 입력에 사용한 R2, R3 값은 보존돼.",
        "hint": "결과를 저장할 주소가 입력 주소와 별도로 있어.",
        "skill": "적용"
      },
      {
        "topic": "확장 opcode",
        "sourcePage": 43,
        "question": "32비트 명령어에서 연산 코드가 7비트라면 표현 가능한 연산 코드 수는?",
        "options": [
          "7개",
          "64개",
          "128개",
          "256개"
        ],
        "answerIndex": 2,
        "explanation": "연산 코드가 n비트면 2ⁿ개를 나타낼 수 있어. 자료 43쪽의 7비트 연산 코드는 2⁷=128개를 지정해.",
        "hint": "비트 수에 따른 조합 수는 2의 거듭제곱이야.",
        "skill": "적용"
      },
      {
        "topic": "논리·시프트",
        "sourcePage": 48,
        "question": "비트 값 1을 다른 비트와 XOR하면 어떤 효과가 생길까?",
        "options": [
          "비트를 항상 0으로 만든다",
          "비트 값을 반전한다",
          "값을 그대로 유지한다",
          "비트를 왼쪽으로 이동한다"
        ],
        "answerIndex": 1,
        "explanation": "자료 48쪽은 어떤 비트를 1과 XOR하면 원래 값과 반대 값을 만든다고 설명해. 0 XOR 1 = 1, 1 XOR 1 = 0이야.",
        "hint": "XOR은 두 입력이 다르면 1이야.",
        "skill": "적용"
      },
      {
        "topic": "논리·시프트",
        "sourcePage": 50,
        "question": "양의 정수 6을 왼쪽으로 2비트 시프트했다. 오버플로가 없다면 값은?",
        "options": [
          "3",
          "12",
          "18",
          "24"
        ],
        "answerIndex": 3,
        "explanation": "자료 50쪽에 따르면 양의 정수를 k비트 왼쪽으로 시프트하면 오버플로가 없을 때 2ᵏ를 곱한 것과 같아. 6×2²=24야.",
        "hint": "왼쪽으로 2비트 이동은 4를 곱하는 것과 같아.",
        "skill": "적용"
      }
    ]
  }
};
