---
title: 'React-hook-form을 사용하며 마주치는 상황들'
date: '2022-09-26'
tags: 'React,Form,React-hook-form'
---

![banner](./react-using-react-hook-form-img/banner.png)

React에서 Form을 useState를 사용한 Controlled 방식으로 관리하다보면 Form이 복잡해지고, 관리해야하는 필드의 수가 늘어날수록
코드의 양도 방대해진다. 더군다나 보통 하나의 Input에는 유효성 검사와 그에 따른 Error처리 관련 로직이 따라 붙으므로 적절하게 컴포넌트화가
되어있지 않다면 그야말로 지옥이 되어버린다.. 또한 필드가 늘어날수록 리렌더링에 의한 성능 이슈를 겪을 수 있기 마련이다.  
그래서 입사를하고 나서부터는 **각 Input의 값이 state가 아닌 DOM에 저장되는 방식인 Uncontrolled Form**을 사용하기로
하였고 Form을 Uncontrolled 방식으로 보다쉽게 다룰 수 있게하는 [React-Hook-Form 라이브러리](https://react-hook-form.com/)를 적극 사용하였다.
그래서 이번엔 react-hook-form을 사용하면서 마주쳤던 상황을 정리해보는 시간을 가져보려고 한다.

## 1. 기본사용

기본적으로 대부분의 폼은 다음과 같은 형식일 것 같다. 나와같은 경우에는 더 좋은 사용자 경험을 위해 `onChange mode`를 사용해왔다.
mode 설정을 통해 유효성 검사 시점을 정할 수 있다. **`onChange` 모드는 각 Input의 change 이벤트가 발생할시 유효성 검사가 trigger 된다.**
또한 유효성 검사 실패시 formState의 errors를 통해 메세지를 손쉽게 표출시킬수 있다.

```tsx
const Signup = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpForm>({ mode: 'onChange' })

  const handleSignupFormSubmit = (formValue: SignUpForm) => {
    // Submit 핸들링
  }

  return (
    <form onSubmit={handleSubmit(handleSignupFormSubmit)}>
      <label htmlFor="user-id">아이디</label>
      <input
        {...register('userID', {
          required: Message.valid.REQUIRE_ID,
          pattern: {
            value: RegExps.user.ID,
            message: Message.valid.INVALID_ID,
          },
        })}
        id="user-id"
        placeholder="아이디를 입력해 주세요."
        type="text"
      />
      <div role="alert">{errors.userID && errors.userID.message}</div>
    </form>
  )
}

export default Signup
```

## 2. pattren을 통한 유효성 검사 지정

register의 두번째 인자인 Options의 `pattern`를 통해 유효성 검사 정규식을 지정할 수 있다. 이때 패턴을 객체로 제공하면 유효성 검사가 실패했을때의 메시지도 함께 지정해 줄 수 있다.
이와 유사하게 Options의 `require`에도 boolean 대신 메시지를 지정해 줄 수 있다.  
두 경우 모두 유효성 검사시 에러의 경우 `formState.errors.fieldname.message`로 접근 할 수 있다.

```tsx{17,18,19,20}
const TestForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FindIdForm>({ mode: 'onChange' })

  const handleSubmitForm = (formValues: FindIdForm) => {
    ///..
  }

  return (
    <form onSubmit={handleSubmit(handleSubmitForm)}>
      <label htmlFor="user-name">이름</label>
      <input
        {...register('name', {
          required: '이름을 입력해 주세요.',
          pattern: {
            value: /^[가-힣]{2,5}$/,
            message: '올바른 형식의 이름을 입력해 주세요.',
          },
        })}
        id="user-name"
        placeholder="이름을 입력해 주세요"
        type="text"
      />
      <div>{errors.name && errors.name.message}</div>
      <button type="submit">제출</button>
    </form>
  )
}

export default TestForm
```

## 3. validate를 통한 유효성 검사 지정

register의 두번째 인자인 Options의 `validate`를 통해 유효성 검사 메서드를 지정할 수 있다. **이때 해당 함수의 첫번째 파라미터로
필드의 현재 value가 들어가게된다.** 이를 이용하여 다양한 형태로 유효성 검사를 진행 할 수 있다.  
아래 예시는 **지정된 필드를 감시하는 watch**를 추가로 사용하여 비밀번호 확인 유효성 검사를 진행한다.
이를 통해 비밀번호 필드와 비밀번호 확인 필드의 값이 같은지 쉽게 검사할 수 있다.

```tsx{12,13,14,24}
const TestForm = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm < PasswordForm > { mode: 'onChange' }

  const handleSubmitForm = (formValues: PasswordForm) => {
    ///..
  }

  const validateConfirmPasswordField = (value: string) =>
    value === watch('password') || Message.valid.INVALID_PASSWORD_CONFIRM

  return (
    <form onSubmit={handleSubmit(handleSubmitForm)}>
      <div>
        <label htmlFor="user-confirm-password">비밀번호 확인</label>
      </div>
      <input
        {...register('confirmPassword', {
          required: '비밀번호를 다시 입력해 주세요.',
          validate: validateConfirmPasswordField,
        })}
        id="user-confirm-password"
        type="password"
        placeholder="비밀번호를 다시 입력해 주세요."
      />
      <div>{errors.confirmPassword && errors.confirmPassword.message}</div>
    </form>
  )
}

export default TestForm
```

이를 더 응용하면 아래와 같이 타 검증 라이브러리를 이용하여 유효성 검사를 진행 할 수도 있다.
아래는 내부적으로 [google-libphonenumber](https://www.npmjs.com/package/google-libphonenumber)를 사용하는 util함수로 선택된 국가코드에 알맞게
핸드폰 번호의 유효성 검사를 진행한다.

```jsx{5,6,7,18}
const TestForm = () => {

  //생략...

  const validatePhoneField = (value: string) =>
    International.phoneValidater(value, watch('phoneRegionCode')) || Message.valid.INVALID_PHONE


  return (
    <form onSubmit={handleSubmit(handleSubmitForm)}>
      {/* 생략... */}
      <div>
        <label htmlFor="user-phone-input">전화번호</label>
      </div>
      <input
        {...register('phone', {
          required: Message.valid.REQUIRE_PHONE,
          validate: validatePhoneField,
        })}
        id="user-phone-input"
        placeholder="전화번호를 입력해 주세요"
        type="number"
      />
      <div>{errors.phone && errors.phone.message}</div>
    </form>
  )
}

export default TestForm
```

## 4. trigger를 사용한 선택적 유효성 검사 실행

폼을 작성하다보면 특정한 필드만 먼저 유효성 검사를 해야할 경우가 생긴다. 예를들어 회원가입폼을 만든다고 가정해보자
회원가입시 전화번호 인증을 위해 전화번호 입력 필드만 먼저 유효성을 검사하고 백엔드에 요청을 보내야 한다.  
이런 경우에는 `trigger`를 통해 특정 필드만 유효성 검사를 진행할 수 있다. trigger의 리턴 타입은 `Promise<boolean>`이므로 후속처리 메서드나 await를 사용해 리턴값을 가져오면 된다.

```tsx{14}
const TestForm = () => {
  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm<SignUpForm>({ mode: 'onChange' })

  const handleSubmitForm = (formValues: SignUpForm) => {
    //..
  }

  const handleSendSMSClick = async () => {
    const validate = await trigger('phone')
    if(validate){
      //..
    }
  }

  return <form onSubmit={handleSubmit(handleSubmitForm)}>{/* 생략 */}</form>
}

export default TestForm
```

## 5. setError를 사용한 custom error 표출

회원가입폼에서 휴대폰번호 중복검사, 닉네임 중복검사등 **API 요청을 통해 추가적으로 검증후에 그 결과를 핸들링**해야 할 때가 있다.
이런 상황에서 검증에 실패 했을 경우 `setError`를 통해 **기존 에러 표출 필드를 재사용하면서 서버측의 응답을 자연스럽게 연결**시킬 수 있다.  
아래 코드는 회원가입 프로세스에서 휴대폰인증을 위한 인증코드 전송을 요청하는 부분이며 하이라이트되는 부분을 보면 알수 있듯이
모종의 이유(중복된 휴대폰 번호 등)로 인증코드 검증이 실패할시 서버로부터 응답받은 에러 메시지를 `setError`를 통해 **기존 error 필드에 표출하는 코드이다.**

이렇게 기존 존재하는 필드에 설정된 custom error는 해당필드가 **register의 관련 규칙(require, pattren)등을 통과하면 자동으로 초기화된다**.
아래 코드의 경우에 useForm은 onChange 모드이므로 사용자가 custom error를 마주친 후 이를 인지하고 휴대폰 번호 필드값을 바꾸는 순간에 custom error는 초기화된다.

```tsx{24,25,26,27}
const SignUpForm = () => {
  const {
    register,
    handleSubmit,
    watch,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<SignUpForm>({ mode: 'onChange' })

  //...생략

  const handleSendSMSClick = async () => {
    const isValid = await trigger('phone')
    const formValue = getValues()
    formValue.phone = International.parsePNFe164(formValue.phone, watch('phoneRegionCode'))
    if (isValid) {
      sendCodeMutation.mutate(formValue, { // 서버측으로 인증코드 전송 요청
        onSuccess: () => {
          setIsSendedConfirmCode(true)
        },
        onError: (err) => {
          if(err instanceof BadRequestError){
            setError('phone', {
              type: 'custom',
              message: err.message,
            })
          }
          else{
            //...
          }
        },
      })
    }
  }

  return <form onSubmit={handleSubmit(handleSubmitForm)}>{/* 생략 */}</form>
}
```

## 6. field error 한번에 핸들링하기

상황에따라 필드 유효성 검사 결과를 **실시간이 아닌 폼 제출시점에 한번에 모아서 사용자에게 따로 표출해줘야 했을때**가 있었다. 이럴때는 useForm의 `handleSubmit`의 두번째 인수로
`(errors: Object, e?: Event) => void` 타입의 에러핸들러를 넣어주면 손쉽게 처리 할 수 있다.
아래 코드는 **useForm의 mode가 onSubmit일때** 폼 제출시 유효성 검사 결과를 모달로 띄워주는 예시 이다.

```tsx{21}
const TestForm = () => {
  const { register, handleSubmit } = useForm<TestForm>({ mode: 'onSubmit' })
  const [openModal] = useModal()

  const handleSubmitForm = (formValues: TestForm) => {
    //..
  }

  const handleFormError = async (
    errors: FieldErrorsImpl<DeepRequired<TestForm>>
  ) => {
    const modalRes = await openModal(
      <MessageModal>
        {Object.entries(errors).map(([key, fieldError]) => (
          <div key={key}>{fieldError.message}</div>
        ))}
      </MessageModal>
    )
    //...
  }

  return <form onSubmit={handleSubmit(handleSubmitForm,handleFormError)}>{/* 생략 */}</form>
}

export default TestForm
```

## 7. Form Context과 render props 패턴을 통한 form 컴포넌트화

input 필드가 많아지거나 각 필드 끼리의 의존관계가 복잡해질수록 Form을 여러 컴포넌트로 나누기가 어려워진다.
가장상위 Wrapper 컴포넌트를 만들어서 처리할수도 있겠지만 컴포넌트의 깊이가 깊어질수록 props drilling 문제가
발생하게 된다.  
한때 커머스 페이지를 제작해야할때가 있었는데 필드의 갯수가 많아 적절히 구조화된 컴포넌트로 나누기가 힘들었었다. **해결은 react-hook-form의 [FormContext](https://react-hook-form.com/advanced-usage#ConnectForm)를 이용**하였으며 공식문서에도 친절히 소개되어있으니 봐보면 좋을것 같다.

먼저 복잡도가 높은폼을 구조화할때 다음과 같이 **label, input, error field를 같이 묵어서 컴포넌트화** 시키는 방법을 먼저 떠올려볼 수 있다. **내부적으로 React의 ContextAPI를 사용하는 `FormProvider`를** 사용함으로서 개별 컴포넌트에서
`useFormContext`를 이용하여 useForm의 메서드들을 사용할 수 있게 한다.

```tsx
// PhoneInput

const PhoneInput = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<TestForm>()

  //..생략
  return (
    <>
      <label htmlFor="user-phone">전화번호</label>
      <input
        {...register('phone', {
          required: Message.valid.REQUIRE_PHONE,
          validate: validatePhoneField,
        })}
        id="user-phone"
        placeholder="전화번호를 입력해 주세요"
        type="number"
      />
      <div>{errors.phone && errors.phone.message}</div>
    </>
  )
}

// Parent

interface TestForm {
  phone: string
}

const TestForm = () => {
  const methods = useForm<TestForm>({ mode: 'onChange' })
  const {
    handleSubmit,
    formState: { errors },
  } = methods

  const handleSubmitForm = (formValues: TestForm) => {
    //..
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleSubmitForm)}>
        <PhoneInput />
      </form>
    </FormProvider>
  )
}

export default TestForm
```

이와 더불어 아래코드와 같이 **render props 패턴을 이용해 useForm의 메서드를 전달하는 `ConnectForm` 컴포넌트**를 만들어서
FormProvider 내부에서 **useFormContext를 사용하는 컴포넌트와 그렇지 않은 컴포넌트** 둘다 활용할 수 있다. 추가적으로 typescript를
이용하는 경우 각 필드의 타입을 유추할수 있게 제네릭을 이용해주자.

```tsx{37,38,39}

// ConnectForm

interface ConnectFormProps<T extends FieldValues> {
  children(methods: UseFormReturn<T>): React.ReactElement
}

const ConnectForm = <T extends FieldValues>({
  children,
}: ConnectFormProps<T>) => {
  const methods = useFormContext<T>()
  return children({ ...methods })
}

// Parent

interface TestForm {
  phone: string
  another: string
}

const TestForm = () => {
  const methods = useForm<TestForm>({ mode: 'onChange' })
  const {
    handleSubmit,
    formState: { errors },
  } = methods

  const handleSubmitForm = (formValues: TestForm) => {
    //..
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleSubmitForm)}>
        <PhoneInput />
        <ConnectForm<TestForm>>
          {({ register }) => <input {...register('another')} />}
        </ConnectForm>
      </form>
    </FormProvider>
  )
}

export default TestForm
```

<br/>
이렇게 이번엔 react-hook-form을 사용하여 폼을 개발할때 자주 마주쳤던 상황을 정리해 보았다.
사실 공식문서가 정말 상세하고 친철하게 정리되어있어서 여러 다양한 상황에 대한
대처법이 잘 나와있는 편이다. 그래서 uncontrolled 방식의 form을 만들때 자주 사용했었다.
물론 상황에따라 uncontrolled만 무조건적으로 사용하는 방식이 아닌 controlled 방식과 useimperativehandle를 추가로 같이 이용해 준다면 더 확장성있고 유연한 컴포넌트를 만들 수 있을 것 같다.

## Reference

- [react-hook-form-api](https://react-hook-form.com/api)
- [react-hook-form-advanced-usage](https://react-hook-form.com/advanced-usage)
- [react-hook-form-ts](https://react-hook-form.com/ts)
