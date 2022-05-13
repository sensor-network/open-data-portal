import styles from "~/styles/Footer.module.css";
import Link from "next/link";
import { useWidth } from "~/lib/hooks";
import { NAV_HEIGHT } from "~/lib/constants";

const Footer: React.FC = () => {
  const width = useWidth();
  const isMobile = width < 768;
  const marginBottom = isMobile ? NAV_HEIGHT : 0;
  return (
    <div className={styles.footer} style={{ marginBottom }}>
      <div className={styles.content}>
        <p>
          Copyright (c) 2022 under the{" "}
          <Link href="https://github.com/sensor-network/open-data-portal/blob/main/LICENSES/MIT.txt">
            MIT License.
          </Link>{" "}
          Made by students at <Link href="https://bth.se">BTH</Link>:
        </p>
        <ul className={styles.students}>
          <li>
            <Link href="https://github.com/juliusmarminge">
              Julius Marminge
            </Link>
          </li>
          <li>
            <Link href="https://github.com/MajedFakhrEldin">
              Majed Fakhr Eldin
            </Link>
          </li>
          <li>
            <Link href="https://github.com/nilsperssonsuorra">
              Nils Persson Suorra
            </Link>
          </li>
          <li>
            <Link href="https://github.com/anva19">Andre Varga</Link>
          </li>
          <li>
            <Link href="https://github.com/Peshkatar">Arlind Iseni</Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Footer;
