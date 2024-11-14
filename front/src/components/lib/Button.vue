<template>
  <div
    class="button"
    :class="!text ? 'iconOnly' : ''"
    :title="title"
    @click="handleClick"
    v-bind="$attrs"
  >
    <div v-if="showIcon('left')" class="iconContainer">
      <Icon :name="icon" />
    </div>
    <p v-if="text">{{ text }}</p>
    <div v-if="showIcon('right')" class="iconContainer">
      <Icon :name="icon" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Icon from "./Icon.vue";
const props = defineProps({
  icon: String,
  text: String,
  title: String,
  type: {
    type: String,
    default: "button",
  },
  leftIcon: Boolean,
  rightIcon: Boolean,
});
const emit = defineEmits(["click"]);

const handleClick = (event) => {
  emit("click", event);
};

const showIcon = (side) => {
  if (side === "right") {
    if (props.rightIcon === true) return true;
  } else if (side === "left") {
    if (props.icon && props.leftIcon === "false") return false;
    else if (props.icon) return true;
  }
};
</script>

<style lang="scss" scoped>
.button {
  border: #144078 1px solid;
  background-color: #050c17;
  color: #fff;
  padding: 5px 25px;
  width: fit-content;
  border-radius: 5px;
  text-decoration: none;
  transition: all 0.1s ease;
  cursor: pointer;
  p {
    text-decoration: none;
  }
  &:hover {
    background-color: #0f1d35;
  }
  &.cta {
    background-color: #fca311;
    border-color: #fca311;
    &:hover {
      background-color: #d1850c;
      border-color: #d1850c;
    }
  }
  &.full-width {
    width: 100%;
    text-align: center;
  }
}

// .button {
//   display: flex;
//   align-items: center;
//   gap: 0.5rem;
//   padding: 0.2rem 0.7rem;
//   width: fit-content;
//   // background-color: #e4e6c3;
//   // border-radius: 0.3rem;
//   border: 1px #acb79e solid;
//   transition: all 0.1s ease-out;
//   user-select: none;
//   color: #000;
//   .iconContainer {
//     width: 15px;
//     height: 15px;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     .icon {
//       width: 15px;
//       height: 15px;
//       display: flex;
//       align-items: center;
//       justify-content: center;
//       transition: all 0.1s ease-out;
//       fill: none;
//       stroke: #fff;
//     }
//   }
//   &.iconOnly {
//     padding: 0.2rem 0.2rem;
//   }

//   &:hover {
//     background-color: #899878;
//     cursor: pointer;
//     .icon {
//       // fill: #5f4bb6;
//     }
//   }
//   &.nobg {
//     background-color: transparent;
//     &:hover {
//       background-color: #f0f2fd;
//       cursor: pointer;
//     }
//   }
//   &.disabled {
//     background-color: #6d6d6d;
//     cursor: not-allowed;
//     &:hover {
//       background-color: #6d6d6d;
//     }
//   }
//   &.primary {
//     background-color: #899878;
//     &:hover {
//       background-color: #acb79e;
//     }
//   }
//   &.small {
//     padding: 0.1rem 0.5rem;
//     font-size: 0.8rem;
//   }
// }
</style>
